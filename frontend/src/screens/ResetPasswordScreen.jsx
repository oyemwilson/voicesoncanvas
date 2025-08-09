import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useResetPasswordMutation } from '../slices/usersApiSlice';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';

const ResetPasswordScreen = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const sp = new URLSearchParams(search);
  const resetToken = sp.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const submitHandler = async (e) => {
    e.preventDefault();
    
    if (!passwordRegex.test(newPassword)) {
      toast.error(
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await resetPassword({ resetToken, newPassword }).unwrap();
      toast.success('Password reset successfully! You can now log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to reset password.');
    }
  };

  return (
    <FormContainer>
      <h1 className="text-2xl font-bold mb-4">Set New Password</h1>
      <form onSubmit={submitHandler}>
        <div className="my-2">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            New Password
          </label>
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <p className="mt-1 text-xs text-gray-500">
            Must be 8+ characters with uppercase, lowercase, number, and special character
          </p>
        </div>

        <div className="my-2">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-950 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset Password
          </button>

          {isLoading && (
            <div className="mt-3 flex items-center justify-center text-gray-600">
              <Loader className="mr-2 h-5 w-5" />
            </div>
          )}
        </div>
      </form>
    </FormContainer>
  );
};

export default ResetPasswordScreen;