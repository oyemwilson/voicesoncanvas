import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaTrash, FaStar, FaShieldAlt, FaLock, FaHandHoldingHeart } from 'react-icons/fa';
import Message from '../components/Message';
import { addToCart, removeFromCart } from '../slices/cartSlice';
import { CurrencyContext } from '../components/CurrencyContext';

const currencySymbols = {
  NGN: '₦',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
};

const CartScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get currency and rates from context
  const { currency, rates } = useContext(CurrencyContext);
  const rate = rates[currency] || 1;
  const symbol = currencySymbols[currency] || currency;


  const nf = new Intl.NumberFormat(currency === 'NGN' ? 'en-NG' : 'en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  const addToCartHandler = (product, qty) => {
    dispatch(addToCart({ ...product, qty }));
  };

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const checkoutHandler = () => {
    navigate('/login?redirect=/shipping');
  };

  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const subtotalUSD = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);
  const subtotalConverted = nf.format(subtotalUSD * rate);


  return (
    <div className="flex flex-wrap -mx-4">
      <div className="w-full md:w-2/3 px-4">
        <h1 className="text-3xl font-bold mb-5">Shopping Cart</h1>
        {cartItems.length === 0 ? (
          <Message>
            Your cart is empty <Link to="/">Go Back</Link>
          </Message>
        ) : (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {cartItems.map((item) => {
              const convertedPrice = nf.format(Number(item.price) * rate);
              return (
                <div key={item._id} className="p-4 border-b last:border-b-0">
                  <div className="grid grid-cols-12 items-center gap-3 sm:gap-4">
                    {/* Image */}
                    <div className="col-span-4 sm:col-span-2">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full aspect-square object-cover rounded-md"
                      />
                    </div>

                    {/* Name (and mobile price) */}
                    <div className="col-span-8 sm:col-span-3">
                      <Link
                        to={`/product/${item._id}`}
                        className="text-blue-600 hover:underline line-clamp-2"
                      >
                        {item.name}
                      </Link>

                      {/* Price on mobile */}
                      <div className="mt-1 sm:hidden text-gray-800 font-semibold">
                        {symbol}{convertedPrice}{' '}
                        <span className="text-sm text-gray-500">({currency})</span>
                      </div>
                    </div>

                    {/* Price on ≥sm */}
                    <div className="hidden sm:block sm:col-span-2 text-gray-800 font-semibold">
                      {symbol}{convertedPrice}{' '}
                      <span className="text-sm text-gray-500">({currency})</span>
                    </div>

                    {/* Qty */}
                    <div className="col-span-8 sm:col-span-3 md:col-span-2">
                      <label className="sr-only" htmlFor={`qty-${item._id}`}>
                        Quantity
                      </label>
                      <select
                        id={`qty-${item._id}`}
                        value={item.qty}
                        onChange={(e) => addToCartHandler(item, Number(e.target.value))}
                        className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        {[...Array(item.countInStock).keys()].map((x) => (
                          <option key={x + 1} value={x + 1}>
                            {x + 1}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Remove */}
                    <div className="col-span-4 sm:col-span-1 flex sm:justify-end">
                      <button
                        type="button"
                        onClick={() => removeFromCartHandler(item._id)}
                        className="text-red-500 hover:text-red-700 focus:outline-none"
                        aria-label={`Remove ${item.name}`}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="w-full md:w-1/3 px-4 mt-6 md:mt-0">
        <div className="border border-gray-200 rounded-lg p-4 mt-24">
          <h2 className="text-xl font-bold mb-4">
            Subtotal ({totalItems} items)
          </h2>
          <div className="text-2xl font-bold mb-4">
            {symbol}{subtotalConverted}{' '}
            <span className="text-sm text-gray-500">({currency})</span>
          </div>
          <button
            type="button"
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={cartItems.length === 0}
            onClick={checkoutHandler}
          >
            Proceed To Checkout
          </button>

          {/* ---- Benefits Section (added) ---- */}
          <div className="mt-6 border-t pt-5" aria-labelledby="cart-benefits-title">
            <h3 id="cart-benefits-title" className="sr-only">Why shop with us</h3>
<ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">

              <li className="flex items-start gap-3">
                <span className="shrink-0 p-2 rounded-full bg-gray-100">
                  <FaStar aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold">Thousands Of Five-Star Reviews</p>
                  <p className="text-sm text-gray-600">
                    We deliver world-class customer service to all of our art buyers.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="shrink-0 p-2 rounded-full bg-gray-100">
                  <FaShieldAlt aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold">Satisfaction Guaranteed</p>
                  <p className="text-sm text-gray-600">
                    Our 14-day satisfaction guarantee allows you to buy with confidence.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="shrink-0 p-2 rounded-full bg-gray-100">
                  <FaLock aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold">Safe &amp; Secure Shopping</p>
                  <p className="text-sm text-gray-600">
                    All payments and transactions are secure and encrypted.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="shrink-0 p-2 rounded-full bg-gray-100">
                  <FaHandHoldingHeart aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold">Support An Artist With Every Purchase</p>
                  <p className="text-sm text-gray-600">
                    We pay our artists more on every sale than other galleries.
                  </p>
                </div>
              </li>
            </ul>
          </div>
          {/* ---- /Benefits Section ---- */}
        </div>
      </div>
    </div>
  );
};

export default CartScreen;
