import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { setCredentials } from '../slices/authSlice';
import { useVerifyEmailMutation, useResendOtpMutation } from '../slices/usersApiSlice';
import FormContainer from '../components/FormContainer';

const VerifyEmailScreen = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const sp = new URLSearchParams(search);
  const email = sp.get('email');

  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);

  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const [resendOtp, { isLoading: resendLoading }] = useResendOtpMutation();

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const submitHandler = async (e) => {
    e.preventDefault();
    const trimmedOtp = otp.trim();

    if (!email) {
      toast.error('No email provided for verification.');
      return;
    }

    if (!trimmedOtp) {
      toast.error('Please enter the OTP.');
      return;
    }

    try {
      const res = await verifyEmail({ email, otp: trimmedOtp }).unwrap();
      // ✅ Update auth state with verified user info
      dispatch(setCredentials(res));
      toast.success(res.message || '✅ Email verified successfully!');
      navigate('/'); // redirect home
    } catch (err) {
      console.error('Verify email error:', err);
      toast.error(err?.data?.message || '❌ Invalid OTP or verification failed.');
    }
  };

  const resendHandler = async () => {
    if (!email) {
      toast.error('No email provided.');
      return;
    }

    try {
      await resendOtp({ email }).unwrap();
      toast.success('✅ OTP resent successfully!');
      setTimer(60); // restart timer
    } catch (err) {
      console.error('Resend OTP error:', err);
      toast.error(err?.data?.message || '❌ Failed to resend OTP.');
    }
  };

  return (
    <FormContainer>
      <h1 className="text-2xl font-bold mb-4 text-center">Verify your email</h1>
      <p className="text-center mb-6">
        We sent an OTP to: <strong>{email}</strong>
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
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline py-2 mb-4"
          placeholder="Enter OTP"
        />

        <button
          type="submit"
          disabled={isLoading}
          className=" bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          {isLoading ? 'Verifying…' : 'Verify Email'}
        </button>
      </form>

      <div className="mt-6 text-center">
        {timer > 0 ? (
          <p className="text-gray-500">Resend OTP in {timer}s</p>
        ) : (
          <button
            onClick={resendHandler}
            disabled={resendLoading}
            className="text-blue-500 hover:underline"
          >
            {resendLoading ? 'Resending…' : 'Resend OTP'}
          </button>
        )}
      </div>
    </FormContainer>
  );
};

export default VerifyEmailScreen;
