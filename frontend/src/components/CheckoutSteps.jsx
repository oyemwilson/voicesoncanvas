import React from 'react';
import { Link } from 'react-router-dom';

const CheckoutSteps = ({ step1, step2, step3, step4 }) => {
  return (
    <div className='flex justify-center mb-4'>
      <div className='flex space-x-4'>
        <div>
          {step1 ? (
            <Link to='/login' className='text-blue-500 hover:text-blue-700'>
              Sign In
            </Link>
          ) : (
            <p className='text-gray-400 cursor-not-allowed'>Sign In</p>
          )}
        </div>

        <div>
          {step2 ? (
            <Link to='/shipping' className='text-blue-500 hover:text-blue-700'>
              Shipping
            </Link>
          ) : (
            <p className='text-gray-400 cursor-not-allowed'>Shipping</p>
          )}
        </div>

        <div>
          {step3 ? (
            <Link to='/payment' className='text-blue-500 hover:text-blue-700'>
              Payment
            </Link>
          ) : (
            <p className='text-gray-400 cursor-not-allowed'>Payment</p>
          )}
        </div>

        <div>
          {step4 ? (
            <Link to='/placeorder' className='text-blue-500 hover:text-blue-700'>
              Place Order
            </Link>
          ) : (
            <p className='text-gray-400 cursor-not-allowed'>Place Order</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutSteps;
