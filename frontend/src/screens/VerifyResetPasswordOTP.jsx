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
    const trimmedOtp = otp.trim();

    if (!trimmedOtp) {
      toast.error('Please enter the OTP.');
      return;
    }

    try {
      const res = await verifyResetOtp({ email, otp: trimmedOtp }).unwrap();
      toast.success('OTP verified! Set your new password.');
      navigate(`/reset-password?token=${res.resetToken}`);
    } catch (err) {
      toast.error(err?.data?.message || 'Invalid or expired OTP.');
    }
  };

  return (
    <div className="mt-10">
      <FormContainer>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Verify Password Reset</h1>
          <p className="mt-2 text-sm text-gray-600">
            We sent a 6-digit code to <span className="font-medium text-gray-800">{email}</span>
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          <form onSubmit={submitHandler} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <div className="mt-1">
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-center tracking-widest text-xl"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Enter the 6-digit code from your email
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || !otp}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-950 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? (
                  <>
                    <Loader className="mr-2" />
                    
                  </>
                ) : (
                  'Verify and Continue'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Didn't receive a code?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              {timer > 0 ? (
                <p className="text-sm text-gray-500">
                  You can request a new code in <span className="font-medium">{timer}s</span>
                </p>
              ) : (
                <button
                  onClick={() => {
                    toast.success('New OTP sent to your email');
                    setTimer(60);
                  }}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
                >
                  Resend Verification Code
                </button>
              )}
            </div>
          </div>
        </div>
      </FormContainer>
    </div>
  );
};

export default VerifyResetOTPScreen;