import React, { useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import CheckoutSteps from '../components/CheckoutSteps';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { useCreateOrderMutation } from '../slices/ordersApiSlice';
import { CurrencyContext } from '../components/CurrencyContext'; // ✅ added
import { clearCartItems }      from '../slices/cartSlice';

const PlaceOrderScreen = () => {
  const navigate = useNavigate();
const dispatch      = useDispatch();

  const { currency, rates } = useContext(CurrencyContext);
  const symbols = { NGN: '₦', USD: '$', EUR: '€', GBP: '£', JPY: '¥' };

  // grab needed cart data
  const { cartItems, shippingAddress, paymentMethod, packagingOption } = useSelector(
    (state) => state.cart
  );

  // calculate summary prices
  const itemsPrice = cartItems
    .reduce((sum, item) => sum + item.price * item.qty, 0)
    .toFixed(2);
  const shippingPrice = itemsPrice > 100 ? 0 : 10; // example rule
  const taxPrice = (0.1 * itemsPrice).toFixed(2);
  const totalPrice = (
    parseFloat(itemsPrice) +
    parseFloat(shippingPrice) +
    parseFloat(taxPrice)
  ).toFixed(2);

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
                    {symbols[currency]}{' '}
                    {((item.price * rates[currency]) || item.price).toFixed(2)} x {item.qty} ={' '}
                    {symbols[currency]}{' '}
                    {((item.price * item.qty * rates[currency]) || item.price * item.qty).toFixed(
                      2
                    )}
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
            <span>
              {symbols[currency]} {(itemsPrice * rates[currency] || itemsPrice).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>
              {symbols[currency]} {(shippingPrice * rates[currency] || shippingPrice).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>
              {symbols[currency]} {(taxPrice * rates[currency] || taxPrice).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>
              {symbols[currency]} {(totalPrice * rates[currency] || totalPrice).toFixed(2)}
            </span>
          </div>

          {error && <Message variant="danger">{error?.data?.message || error.error}</Message>}
          {isLoading && <Loader />}

          <button
            onClick={placeOrderHandler}
            disabled={cartItems.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded disabled:opacity-50"
          >
            Place Order
          </button>
        </div>
      </div>
    </>
  );
};

export default PlaceOrderScreen;
