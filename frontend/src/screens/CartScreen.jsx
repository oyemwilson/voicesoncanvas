import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaTrash } from 'react-icons/fa';
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
  const subtotalConverted = (subtotalUSD * rate).toFixed(2);

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
              const convertedPrice = (item.price * rate).toFixed(2);
              return (
                <div key={item._id} className="flex items-center p-4 border-b last:border-b-0">
                  <div className="w-1/6 pr-4">
                    <img src={item.image} alt={item.name} className="w-full h-auto rounded-md" />
                  </div>
                  <div className="w-1/4 pr-4">
                    <Link to={`/product/${item._id}`} className="text-blue-600 hover:underline">
                      {item.name}
                    </Link>
                  </div>
                  <div className="w-1/6 pr-4 text-gray-800 font-semibold">
                    {symbol}{convertedPrice} <span className="text-sm text-gray-500">({currency})</span>
                  </div>
                  <div className="w-1/6 pr-4">
                    <select
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
                  <div className="w-1/6">
                    <button
                      type="button"
                      onClick={() => removeFromCartHandler(item._id)}
                      className="text-red-500 hover:text-red-700 focus:outline-none"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="w-full md:w-1/3 px-4 mt-6 md:mt-0">
        <div className="border border-gray-200 rounded-lg p-4">
          <h2 className="text-xl font-bold mb-4">
            Subtotal ({totalItems} items)
          </h2>
          <div className="text-2xl font-bold mb-4">
            {symbol}{subtotalConverted} <span className="text-sm text-gray-500">({currency})</span>
          </div>
          <button
            type="button"
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={cartItems.length === 0}
            onClick={checkoutHandler}
          >
            Proceed To Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartScreen;