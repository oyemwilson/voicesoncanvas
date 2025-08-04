// src/pages/OrderScreen.js
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
// Paystack
import { PaystackButton } from 'react-paystack';
// PayPal
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
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

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const StripeCheckoutForm = ({ orderId, payOrder, refetch }) => {
  const stripe = useStripe();
  const elements = useElements();

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    const card = elements.getElement(CardElement);
    const { error, paymentMethod } = await stripe.createPaymentMethod({ type: 'card', card });
    if (error) {
      toast.error(error.message);
      return;
    }
    try {
      await payOrder({ orderId, paymentGateway: 'stripe', paymentMethodId: paymentMethod.id }).unwrap();
      toast.success('Stripe payment successful!');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <form onSubmit={submitHandler} className="mt-4">
      <CardElement className="p-3 border rounded" />
      <button
        type="submit"
        disabled={!stripe}
        className="mt-3 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
      >
        Pay with Stripe
      </button>
    </form>
  );
};

const OrderScreen = () => {
  const SERVICE_FEE = 50;
  const { id: orderId } = useParams();
  const { userInfo } = useSelector((state) => state.auth);

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
    amount: order.totalPrice * 100,
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
                  {item.qty} x ₦{item.price} = ₦{(item.qty * item.price).toFixed(2)}
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
                <span>Service Fee</span>
                <span>₦{SERVICE_FEE}</span>
              </div>
              <div className="flex justify-between"><span>Items</span><span>₦{order.itemsPrice}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>₦{order.shippingPrice}</span></div>
              <div className="flex justify-between"><span>Tax</span><span>₦{order.taxPrice}</span></div>
              <div className="flex justify-between font-bold text-lg"><span>Total</span><span>₦{order.totalPrice + SERVICE_FEE}</span></div>
            </div>

            {/* ── ACTIONS ── */}
            {/* PAYMENT */}
            {!isPaid && isBuyer && (!hasOpenDispute || isDisputeResolved) && (
              <>
                <PaystackButton
                  {...paystackProps}
                  className="w-full mb-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded"
                />
                {paypalKey?.clientId && (
                  <PayPalScriptProvider options={{ 'client-id': paypalKey.clientId }}>
                    <div className="mb-2">
                      <PayPalButtons
                        style={{ layout: 'vertical' }}
                        createOrder={(data, actions) =>
                          actions.order.create({
                            purchase_units: [{ amount: { currency_code: 'NGN', value: order.totalPrice.toString() } }],
                          })
                        }
                        onApprove={async (data, actions) => {
                          const details = await actions.order.capture();
                          toast.success('PayPal payment successful!');
                          await payOrder({
                            orderId,
                            paymentGateway: 'paypal',
                            orderIdOnGateway: data.orderID,
                            payerID: data.payerID,
                            paymentDetails: details,
                          }).unwrap();
                          refetch();
                        }}
                      />
                    </div>
                  </PayPalScriptProvider>
                )}
                <Elements stripe={stripePromise}>
                  <StripeCheckoutForm orderId={orderId} payOrder={payOrder} refetch={refetch} />
                </Elements>
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

            {/* BUYER RESOLVE
            {isBuyer && hasOpenDispute && (
              <button onClick={handleResolve} disabled={loadingUpdate}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded">
                {loadingUpdate ? 'Resolving…' : 'Resolve Dispute'}
              </button>
            )} */}

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
