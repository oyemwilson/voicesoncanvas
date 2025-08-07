// src/pages/OrderScreen.js
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
// Paystack
import { PaystackButton } from 'react-paystack';
// PayPal
import { PayPalButtons } from '@paypal/react-paypal-js';

// Stripe
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

import Message from '../components/Message';
import Loader from '../components/Loader';

import {
  useGetOrderDetailsQuery,
  usePayOrderMutation,
  useGetPaypalClientIdQuery,
  useShipOrderMutation,
  useConfirmReceiptMutation,
  useCreateDisputeMutation,
  useUpdateDisputeMutation,
} from '../slices/ordersApiSlice';
import { useGetPaystackPublicKeyQuery } from '../slices/configApiSlice';
import { useContext } from 'react';
import { CurrencyContext } from '../components/CurrencyContext';

const OrderScreen = () => {
  // % service fee
  const SERVICE_FEE_PERCENT = 0.05;
  // flat $35 shipping (will be converted by your rate)
  const SHIPPING_FLAT_USD = 35;

  const { id: orderId } = useParams();
  const { userInfo } = useSelector((state) => state.auth);

  // pull in your currency & rates
  const { currency, rates } = useContext(CurrencyContext);
  const rate = rates[currency] || 1;
  const symbolMap = { NGN:'₦', USD:'$', EUR:'€', GBP:'£', JPY:'¥' };
  const symbol = symbolMap[currency] || currency;

  const {
    data: order,
    refetch,
    isLoading,
    error,
  } = useGetOrderDetailsQuery(orderId);
  const { data: paystackKey, isLoading: loadingPaystackKey } = useGetPaystackPublicKeyQuery();
  const { data: paypalKey, isLoading: loadingPaypalKey } = useGetPaypalClientIdQuery();

  const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation();
  const [shipOrder, { isLoading: loadingShip }] = useShipOrderMutation();
  const [confirmReceipt, { isLoading: loadingReceipt }] = useConfirmReceiptMutation();
  const [createDispute, { isLoading: loadingDispute }] = useCreateDisputeMutation();
  const [updateDispute, { isLoading: loadingUpdate }] = useUpdateDisputeMutation();

  const [showShipForm, setShowShipForm] = useState(false);
  const [shipCarrier, setShipCarrier] = useState('');
  const [shipTracking, setShipTracking] = useState('');
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDescription, setDisputeDescription] = useState('');

  if (isLoading || loadingPaystackKey || loadingPaypalKey) return <Loader />;
  if (error) return <Message variant="danger">{error?.data?.message}</Message>;

  // Fixed currency calculations
  const itemsTotalLocal = order.itemsPrice * rate;
  const serviceFeeLocal = itemsTotalLocal * SERVICE_FEE_PERCENT;
  // Convert $35 USD to current currency
  let shippingLocal;
  if (currency === 'USD') {
    shippingLocal = SHIPPING_FLAT_USD;
  } else {
    // Convert USD to NGN first, then to target currency
    const usdToNgnRate = 1 / rates['USD']; // 1 USD = how many NGN
    const shippingInNgn = SHIPPING_FLAT_USD * usdToNgnRate; // $35 in NGN
    shippingLocal = shippingInNgn * rate; // Convert NGN to target currency
  }
  const taxLocal = order.taxPrice * rate;
  const grandTotalLocal = itemsTotalLocal + serviceFeeLocal + shippingLocal + taxLocal;

  // USD totals for PayPal - convert from NGN to USD
  const usdRate = rates['USD']; // 0.00066 (1 NGN = 0.00066 USD)
  const itemsTotalUSD = order.itemsPrice * usdRate;
  const serviceFeeUSD = itemsTotalUSD * SERVICE_FEE_PERCENT;
  const taxUSD = order.taxPrice * usdRate;
  const shippingUSD = SHIPPING_FLAT_USD;
  const grandTotalUSD = (itemsTotalUSD + serviceFeeUSD + shippingUSD + taxUSD).toFixed(2);

  // statuses
  const isPaid      = order.isPaid;
  const isShipped   = order.isShipped;
  const isDelivered = order.orderStatus === 'delivered';
  const isBuyer     = order.user._id === userInfo._id;
  const isSeller    = order.orderItems.some((i) => i.seller === userInfo._id);
  const isAdmin     = userInfo?.isAdmin;
  const hasOpenDispute    = order.disputeStatus === 'open';
  const isDisputeResolved = order.disputeStatus === 'resolved';

  const paystackProps = {
    email: order.user.email,
    amount: Math.round(grandTotalLocal * 100), // Paystack expects kobo for NGN
    publicKey: paystackKey.publicKey,
    text: 'Pay with Paystack',
    onSuccess: async (ref) => {
      await payOrder({
        orderId,
        paymentGateway: 'paystack',
        reference: ref.reference,
        status: ref.status,
        email: order.user.email,
      }).unwrap();
      toast.success('Payment successful!');
      refetch();
    },
    onClose: () => toast.info('Paystack window closed'),
  };

  const handleShip = async () => {
    await shipOrder({ orderId, carrier: shipCarrier, trackingNumber: shipTracking }).unwrap();
    toast.success('Order marked shipped');
    setShowShipForm(false);
    refetch();
  };
  const handleReceipt = async () => {
    await confirmReceipt(orderId).unwrap();
    toast.success('Order delivered');
    refetch();
  };
  const handleDispute = async () => {
    await createDispute({ orderId, reason: disputeReason, description: disputeDescription }).unwrap();
    toast.success('Dispute opened');
    setShowDisputeForm(false);
    refetch();
  };
  const handleResolve = async () => {
    await updateDispute({ orderId, status: 'resolved', resolution: 'Resolved by admin' }).unwrap();
    toast.success('Dispute resolved');
    refetch();
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Order {order._id}</h1>
      <div className="flex flex-wrap -mx-4">
        {/* ── LEFT ── */}
        <div className="w-full md:w-2/3 px-4 mb-6">
          {/* Shipping Info */}
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">Shipping</h2>
            <p><strong>Name:</strong> {order.user.name}</p>
            <p>
              <strong>Email:</strong>{' '}
              <a href={`mailto:${order.user.email}`} className="text-blue-500 hover:underline">
                {order.user.email}
              </a>
            </p>
            <p className="mb-4">
              <strong>Address:</strong> {order.shippingAddress.address}, {order.shippingAddress.city},{' '}
              {order.shippingAddress.postalCode}, {order.shippingAddress.country}
            </p>

            {hasOpenDispute && (
              <Message variant="warning">
                <strong>Dispute pending:</strong> shipments & payments are on hold until resolution.
              </Message>
            )}

            {isDelivered ? (
              <Message variant="success">
                Delivered on {new Date(order.deliveredAt).toLocaleDateString()}
                <br />
                <strong>Carrier:</strong> {order.shippingDetails?.carrier}
                <br />
                <strong>Tracking #:</strong> {order.shippingDetails?.trackingNumber}
              </Message>
            ) : isShipped ? (
              <Message variant="info">
                Shipped on {new Date(order.shippingDetails.shippedAt).toLocaleDateString()}
                <br />
                <strong>Carrier:</strong> {order.shippingDetails?.carrier}
                <br />
                <strong>Tracking #:</strong> {order.shippingDetails?.trackingNumber}
              </Message>
            ) : (
              <Message variant="warning">Pending Shipment</Message>
            )}
          </div>

          {/* Payment Info */}
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">Payment Method</h2>
            <p><strong>Method:</strong> {order.paymentMethod}</p>
            {isPaid ? (
              <Message variant="success">Paid on {order.paidAt.substring(0, 10)}</Message>
            ) : (
              <Message variant="danger">Not Paid</Message>
            )}
          </div>

          {/* Items */}
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">Order Items</h2>
            {order.orderItems.map(item => (
              <div key={item._id} className="flex items-center mb-4">
                <div className="w-16 h-16 mr-4">
                  <img src={item.image} alt={item.name} className="object-cover rounded-md w-full h-full" />
                </div>
                <div className="flex-grow">
                  <Link to={`/product/${item.product}`} className="text-blue-500 hover:underline">
                    {item.name}
                  </Link>
                  <p className="text-sm text-gray-600">Packaging: {order.packagingOption}</p>
                </div>
                <div className="text-gray-700">
                  {item.qty} x {symbol}{(item.price * rate).toFixed(2)} = {symbol}{(item.qty * item.price * rate).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="w-full md:w-1/3 px-4">
          <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Packaging Option</span>
                <span>{order.packagingOption}</span>
              </div>

              <div className="flex justify-between">
                <span>Items</span>
                <span>{symbol}{itemsTotalLocal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Service Fee (5%)</span>
                <span>{symbol}{serviceFeeLocal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping ($35 USD)</span>
                <span>{symbol}{shippingLocal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Tax</span>
                <span>{symbol}{taxLocal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{symbol}{grandTotalLocal.toFixed(2)}</span>
              </div>
            </div>

            {/* ── PAYMENT ACTIONS ── */}
            {!isPaid && isBuyer && (!hasOpenDispute || isDisputeResolved) && (
              <>
                {/* Paystack - Only for NGN */}
                {currency === 'NGN' && (
                  <PaystackButton
                    {...paystackProps}
                    className="w-full mb-4 bg-green-600 hover:bg-green-700 text-white py-2 rounded"
                  />
                )}

                {/* PayPal - USD equivalent */}
                <PayPalButtons
                  style={{ layout: 'vertical', tagline: false }}
                  createOrder={(data, actions) =>
                    actions.order.create({
                      purchase_units: [{
                        amount: {
                          currency_code: 'USD',
                          value: grandTotalUSD
                        },
                      }],
                    })
                  }
                  onApprove={async (data, actions) => {
                    const details = await actions.order.capture();
                    await payOrder({
                      orderId,
                      paymentGateway: 'paypal',
                      orderIdOnGateway: data.orderID,
                      payerID: data.payerID,
                      paymentDetails: details,
                    }).unwrap();
                    toast.success('PayPal payment successful!');
                    refetch();
                  }}
                  onCancel={() => toast.info('PayPal payment cancelled')}
                  onError={(err) => toast.error('PayPal error: ' + err.message)}
                />
              </>
            )}

            {/* SHIP */}
            {(isSeller || isAdmin) && isPaid && !isShipped && (!hasOpenDispute || isDisputeResolved) && (
              showShipForm ? (
                <div className="space-y-2">
                  <input value={shipCarrier} onChange={e => setShipCarrier(e.target.value)}
                    placeholder="Carrier" className="w-full p-2 border rounded" />
                  <input value={shipTracking} onChange={e => setShipTracking(e.target.value)}
                    placeholder="Tracking #" className="w-full p-2 border rounded" />
                  <button onClick={handleShip} disabled={loadingShip}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
                    {loadingShip ? 'Sending...' : 'Confirm Ship'}
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowShipForm(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
                  Ship Order
                </button>
              )
            )}

            {/* DELIVER */}
            {isBuyer && isShipped && !isDelivered && (!hasOpenDispute || isDisputeResolved) && (
              <button onClick={handleReceipt} disabled={loadingReceipt}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded">
                {loadingReceipt ? 'Processing...' : 'Mark as Delivered'}
              </button>
            )}

            {/* OPEN DISPUTE */}
            {(isBuyer || isSeller) && order.disputeStatus === 'none' && (
              showDisputeForm ? (
                <div className="space-y-2">
                  <select value={disputeReason} onChange={e => setDisputeReason(e.target.value)}
                    className="w-full p-2 border rounded">
                    <option value="">Reason</option>
                    <option value="item_not_received">Item not received</option>
                    <option value="damaged_item">Damaged item</option>
                    <option value="wrong_item">Wrong item</option>
                    <option value="payment_issue">Payment issue</option>
                    <option value="other">Other</option>
                  </select>
                  <textarea value={disputeDescription} onChange={e => setDisputeDescription(e.target.value)}
                    placeholder="Details" className="w-full p-2 border rounded" />
                  <button onClick={handleDispute} disabled={loadingDispute}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded">
                    {loadingDispute ? 'Opening...' : 'Submit Dispute'}
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowDisputeForm(true)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded">
                  Open Dispute
                </button>
              )
            )}

            {/* ADMIN RESOLVE */}
            {isAdmin && hasOpenDispute && (
              <div className="p-4 bg-yellow-50 border rounded space-y-2">
                <p><strong>Dispute:</strong> {order.dispute.reason.replace(/_/g, ' ')}</p>
                <p>{order.dispute.description}</p>
                <button onClick={handleResolve} disabled={loadingUpdate}
                  className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded">
                  {loadingUpdate ? 'Resolving...' : 'Resolve Dispute'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderScreen;