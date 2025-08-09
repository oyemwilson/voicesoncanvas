import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';
import { useRegisterMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';
import { FaCheck } from 'react-icons/fa';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [returnsAccepted, setReturnsAccepted] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  const [register, { isLoading }] = useRegisterMutation();
  const { userInfo } = useSelector((state) => state.auth);

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get('redirect') || '/';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!passwordRegex.test(password)) {
      return toast.error(
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
      );
    }

    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    if (!termsAccepted || !privacyAccepted || !returnsAccepted) {
      return toast.error('Please accept all terms and policies');
    }

    try {
      const res = await register({ name, email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const CheckboxItem = ({ checked, onChange, label, link }) => (
    <div className="flex items-start mb-3">
      <div className="flex items-center h-5">
        <input
          id={label}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
      </div>
      <div className="ml-3 text-sm">
        <label htmlFor={label} className="font-medium text-gray-700">
          {label.split(' ')[0]} {/* First word */}
          <Link to={link} className="text-blue-600 hover:underline ml-1">
            {label.split(' ').slice(1).join(' ')}
          </Link>
        </label>
      </div>
    </div>
  );

  return (
    <div className="">
      <FormContainer>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Create Account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Join our community of art lovers
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          <form onSubmit={submitHandler} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-gray-500">
                Must be 8+ characters with uppercase, lowercase, number, and special character
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="••••••••"
              />
            </div>

            <div className="mt-6 border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Terms & Policies</h3>
              
              <CheckboxItem
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                label="Accept Terms of Use"
                link="/term-of-use"
              />
              
              <CheckboxItem
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                label="Accept Privacy Policy"
                link="/privacy"
              />
              
              <CheckboxItem
                checked={returnsAccepted}
                onChange={(e) => setReturnsAccepted(e.target.checked)}
                label="Accept Delivery & Returns Policy"
                link="/deliveries-returns"
              />
            </div>

            <div>
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-950 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Account
          </button>

          {isLoading && (
            <div className="mt-3 flex items-center justify-center text-gray-600">
              <Loader className="mr-2 h-5 w-5" />
            </div>
          )}
        </div>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to={redirect ? `/login?redirect=${redirect}` : '/login'}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign in instead
              </Link>
            </div>
          </div>
        </div>
      </FormContainer>
    </div>
  );
};

export default RegisterScreen;