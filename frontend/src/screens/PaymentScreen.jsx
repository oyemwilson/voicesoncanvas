import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import FormContainer from '../components/FormContainer';
import CheckoutSteps from '../components/CheckoutSteps';
import { savePaymentMethod, savePackagingOption } from '../slices/cartSlice';

const PaymentScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // grab the entire cart slice
  const cart = useSelector((state) => state.cart);
  const { shippingAddress, paymentMethod: savedPay, packagingOption: savedPack } = cart;

  // redirect if no shipping address
  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('/shipping');
    }
  }, [shippingAddress, navigate]);

  // local state seeded from Redux
  const [paymentMethod, setPaymentMethod] = useState(savedPay || 'PayPal');
  const [packagingOption, setPackagingOption] = useState(savedPack || 'Standard');

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(savePaymentMethod(paymentMethod));
    dispatch(savePackagingOption(packagingOption));
    navigate('/placeorder');
  };

  return (
    <FormContainer>
      <CheckoutSteps step1 step2 step3 />

      <h1 className="text-2xl font-bold mb-4">Payment & Packaging</h1>

      <form onSubmit={submitHandler}>
        {/* Payment Method */}
        <fieldset className="mb-6">
          <legend className="block text-gray-700 text-sm font-bold mb-2">
            Payment Method
          </legend>
          {['PayPal', 'PayStack', 'Card'].map((method) => (
            <label key={method} className="block mb-2">
              <input
                type="radio"
                name="paymentMethod"
                value={method}
                checked={paymentMethod === method}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-2"
              />
              {method}
            </label>
          ))}
        </fieldset>

        {/* Packaging Option */}
        <fieldset className="mb-6">
          <legend className="block text-gray-700 text-sm font-bold mb-2">
            Packaging Option
          </legend>
          {['Standard', 'Giftwrap', 'Express', 'Eco', 'Deluxe'].map((opt) => (
            <label key={opt} className="block mb-2">
              <input
                type="radio"
                name="packagingOption"
                value={opt}
                checked={packagingOption === opt}
                onChange={(e) => setPackagingOption(e.target.value)}
                className="mr-2"
              />
              {opt}
            </label>
          ))}
        </fieldset>

        <button
          type="submit"
          className="bg-gray-950 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
        >
          Continue
        </button>
      </form>
    </FormContainer>
  );
};

export default PaymentScreen;
