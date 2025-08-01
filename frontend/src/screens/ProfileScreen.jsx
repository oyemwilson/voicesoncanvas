// src/pages/ProfileScreen.js
import React, { useEffect, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useProfileMutation } from '../slices/usersApiSlice';
import { useGetMyOrdersQuery } from '../slices/ordersApiSlice';
import { setCredentials } from '../slices/authSlice';

import Loader from '../components/Loader';
import Message from '../components/Message';
import { CurrencyContext } from '../components/CurrencyContext';

const ProfileScreen = () => {
  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirmPassword, setConfirm] = useState('');

  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  const { data: orders = [], isLoading, error } = useGetMyOrdersQuery();
  const [updateProfile, { isLoading: loadingUpdateProfile }] = useProfileMutation();

  const { currency, rates } = useContext(CurrencyContext);
  const symbols = { NGN: '₦', USD: '$', EUR: '€', GBP: '£', JPY: '¥' };
  const rate    = rates[currency] || 1;

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name);
      setEmail(userInfo.email);
    }
  }, [userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      const res = await updateProfile({ name, email, password }).unwrap();
      dispatch(setCredentials(res));
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Profile Form */}
      <div className="bg-white rounded-xl shadow-md p-6 w-full lg:w-1/3">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-2">
          My Profile
        </h2>
        <form onSubmit={submitHandler} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-600 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              className="border border-gray-300 rounded-md w-full p-2 focus:ring focus:ring-blue-300 outline-none"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="border border-gray-300 rounded-md w-full p-2 focus:ring focus:ring-blue-300 outline-none"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1">
              New Password
            </label>
            <input
              type="password"
              id="password"
              className="border border-gray-300 rounded-md w-full p-2 focus:ring focus:ring-blue-300 outline-none"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-600 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="border border-gray-300 rounded-md w-full p-2 focus:ring focus:ring-blue-300 outline-none"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition-colors w-full"
          >
            {loadingUpdateProfile ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
        {loadingUpdateProfile && <Loader />}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-md p-6 w-full lg:w-2/3">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-2">
          My Orders
        </h2>
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">{error?.data?.message || error.error}</Message>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Order ID</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Date</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Total</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Paid</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Delivered</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => {
                  const convertedTotal = (order.totalPrice * rate).toFixed(2);
                  const isDelivered    = order.orderStatus === 'delivered';
                  return (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm">{order._id}</td>
                      <td className="px-4 py-2 text-sm">{order.createdAt.substring(0, 10)}</td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">
                        {symbols[currency]} {convertedTotal}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {order.isPaid ? (
                          <span className="text-green-600 font-medium">
                            {order.paidAt.substring(0, 10)}
                          </span>
                        ) : (
                          <FaTimes className="text-red-500 inline" />
                        )}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {isDelivered ? (
                          <span className="text-green-600 font-medium">
                            {order.updatedAt.substring(0, 10)}
                          </span>
                        ) : (
                          <FaTimes className="text-red-500 inline" />
                        )}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <Link
                          to={`/order/${order._id}`}
                          className="inline-block bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-1 px-3 rounded-md text-sm"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Message>You have no orders yet.</Message>
        )}
      </div>
    </div>
  );
};

export default ProfileScreen;
