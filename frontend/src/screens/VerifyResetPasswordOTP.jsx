import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useVerifyResetOtpMutation } from '../slices/usersApiSlice';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';

const VerifyResetOTPScreen = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const sp = new URLSearchParams(search);
  const email = sp.get('email');

  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);

  const [verifyResetOtp, { isLoading }] = useVerifyResetOtpMutation();

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error('Please enter the OTP.');
      return;
    }
    try {
      const res = await verifyResetOtp({ email, otp }).unwrap();
      toast.success('OTP verified! Set your new password.');
      // pass resetToken to reset-password screen
      navigate(`/reset-password?token=${res.resetToken}`);
    } catch (err) {
      toast.error(err?.data?.message || 'Invalid or expired OTP.');
    }
  };

  return (
    <FormContainer>
      <h1 className="text-2xl font-bold mb-4 text-center">Verify OTP</h1>
      <p className="text-center mb-6">
        We sent a password reset OTP to: <strong>{email}</strong>
      </p>

      <form onSubmit={submitHandler}>
        <label htmlFor="otp" className="block text-sm font-medium mb-2">
          Enter OTP
        </label>
        <input
          id="otp"
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="border rounded w-full px-3 py-2 mb-4"
          placeholder="Enter OTP"
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          {isLoading ? 'Verifying…' : 'Verify OTP'}
        </button>

        {isLoading && <Loader />}
      </form>
    </FormContainer>
  );
};

export default VerifyResetOTPScreen;
