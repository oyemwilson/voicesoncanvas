import React, { useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import CheckoutSteps from '../components/CheckoutSteps';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { useCreateOrderMutation } from '../slices/ordersApiSlice';
import { CurrencyContext } from '../components/CurrencyContext';
import { clearCartItems } from '../slices/cartSlice';

const PlaceOrderScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currency, rates } = useContext(CurrencyContext);
  const symbols = { NGN: '₦', USD: '$', EUR: '€', GBP: '£', JPY: '¥' };
  const rate = rates[currency] || 1;

  const nf = new Intl.NumberFormat(currency === 'NGN' ? 'en-NG' : 'en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});


  // grab needed cart data
  const { cartItems, shippingAddress, paymentMethod, packagingOption } = useSelector(
    (state) => state.cart
  );

  // calculate summary prices (matching backend logic)
  const itemsPrice = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  
  // Fixed $35 shipping fee
  const SHIPPING_FLAT_USD = 35;
  
  // Convert $35 USD to current currency
  let shippingPrice;
  if (currency === 'USD') {
    shippingPrice = SHIPPING_FLAT_USD;
  } else {
    // Convert USD to NGN first, then to target currency
    const usdToNgnRate = 1 / rates['USD']; // 1 USD = how many NGN
    const shippingInNgn = SHIPPING_FLAT_USD * usdToNgnRate; // $35 in NGN
    shippingPrice = shippingInNgn * rate; // Convert NGN to target currency
  }


  // 5% service fee on items
  const serviceFee = 0.05 * itemsPrice;
  
  // 15% tax (matching backend)
  const taxPrice = 0.075 * itemsPrice;
  
  // Total price in local currency
  const itemsPriceLocal = itemsPrice * rate;
  const serviceFeeLocal = serviceFee * rate;
  const taxPriceLocal = taxPrice * rate;
  
  const totalPrice = itemsPriceLocal + serviceFeeLocal + shippingPrice + taxPriceLocal;

  const itemsPriceLocalStr = nf.format(itemsPrice * rate);
const serviceFeeLocalStr = nf.format(serviceFee * rate);
const shippingPriceStr   = nf.format(shippingPrice);
const taxPriceLocalStr   = nf.format(taxPrice * rate);
const totalPriceStr      = nf.format(totalPrice);

  const [createOrder, { data: order, isLoading, error, isSuccess }] =
    useCreateOrderMutation();

  // on success, redirect to order details
  useEffect(() => {
    if (isSuccess) {
      navigate(`/order/${order._id}`);
    }
  }, [isSuccess, navigate, order]);

  const placeOrderHandler = async () => {
    try {
      await createOrder({
        orderItems: cartItems,
        shippingAddress,
        paymentMethod,
        packagingOption,
      }).unwrap();

      dispatch(clearCartItems());
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      <CheckoutSteps step1 step2 step3 step4 />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
        {/* Left: Order Summary */}
        <div className="lg:col-span-2 space-y-4">
          {/* Shipping */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-2">Shipping</h2>
            <p>
              {shippingAddress.address}, {shippingAddress.city},{' '}
              {shippingAddress.postalCode}, {shippingAddress.country}
            </p>
          </div>

          {/* Payment */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-2">Payment</h2>
            <p>{paymentMethod}</p>
          </div>

          {/* Packaging */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-2">Packaging</h2>
            <p>{packagingOption}</p>
          </div>

          {/* Items */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-2">Order Items</h2>
            {cartItems.length === 0 ? (
              <Message>Your cart is empty</Message>
            ) : (
              cartItems.map((item) => (
                <div key={item._id} className="flex items-center mb-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <Link
                    to={`/product/${item._id}`}
                    className="flex-1 ml-3 hover:underline"
                  >
                    {item.name}
                  </Link>
                  <span>
<span>
  {symbols[currency]} {nf.format(Number(item.price) * rate)} x {item.qty} ={' '}
  {symbols[currency]} {nf.format(Number(item.price) * Number(item.qty) * rate)}
</span>

                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Costs & Place Order */}
        <div className="bg-white p-4 rounded shadow space-y-3">
          <h2 className="font-semibold text-lg">Order Summary</h2>
          
          <div className="flex justify-between">
            <span>Items</span>
            <span>{symbols[currency]} {itemsPriceLocalStr}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Service Fee (5%)</span>
            <span>{symbols[currency]} {serviceFeeLocalStr}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Shipping ($35 USD)</span>
            <span>{symbols[currency]} {shippingPriceStr}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Tax (7.5%)</span>
            <span>{symbols[currency]} {taxPriceLocalStr}</span>
          </div>
          
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total</span>
            <span>{symbols[currency]} {totalPriceStr}</span>
          </div>

          {error && <Message variant="danger">{error?.data?.message || error.error}</Message>}
          {isLoading && <Loader />}

          <button
            onClick={placeOrderHandler}
            disabled={cartItems.length === 0}
            className="w-full bg-gray-950 hover:bg-gray-600 text-white font-bold py-2 rounded disabled:opacity-50"
          >
            Place Order
          </button>
        </div>
      </div>
    </>
  );
};

export default PlaceOrderScreen;