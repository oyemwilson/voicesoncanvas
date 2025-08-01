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

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const submitHandler = async (e) => {
    e.preventDefault();
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

        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4 w-full"
        >
          {isLoading ? 'Resetting…' : 'Reset Password'}
        </button>

        {isLoading && <Loader />}
      </form>
    </FormContainer>
  );
};

export default ResetPasswordScreen;
