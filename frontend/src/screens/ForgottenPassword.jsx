import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import FormContainer from '../components/FormContainer';
import Loader from '../components/Loader';

// You need to add this endpoint in your usersApiSlice (see below)
import { useForgotPasswordMutation } from '../slices/usersApiSlice';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address.');
      return;
    }
    try {
      const res = await forgotPassword({ email }).unwrap();
      toast.success(res.message || 'Password reset OTP sent to your email!');
      // ✅ optionally navigate to verify-reset-otp page if you have one
      navigate(`/verify-reset-otp?email=${encodeURIComponent(email)}`);
      
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to send reset OTP.');
    }
  };

  return (
    <FormContainer>
      <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>
      <p className="mb-6 text-gray-600">
        Enter your account email and we’ll send you an OTP to reset your password.
      </p>

      <form onSubmit={submitHandler}>
        <div className="my-2">
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4 w-full"
        >
          {isLoading ? 'Sending...' : 'Send OTP'}
        </button>

        {isLoading && <Loader />}
      </form>
    </FormContainer>
  );
};

export default ForgotPasswordScreen;
