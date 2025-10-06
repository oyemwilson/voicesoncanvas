// src/pages/ProfileScreen.js
import React, { useEffect, useState, useContext, useMemo } from 'react';
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

  // --- NEW: pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 8;

  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  // Note: existing hook unchanged (client-side pagination)
  const { data: orders = [], isLoading, error } = useGetMyOrdersQuery();
  const [updateProfile, { isLoading: loadingUpdateProfile }] = useProfileMutation();

  const { currency, rates } = useContext(CurrencyContext);
  const symbols = { NGN: '₦', USD: '$', EUR: '€', GBP: '£', JPY: '¥' };
  const rate = rates[currency] || 1;

  const SERVICE_FEE_PERCENT = 0.05;
  const SHIPPING_FLAT_USD = 35;

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

  const calculateOrderTotal = (order) => {
    const itemsPrice = parseFloat(order.itemsPrice);
    const serviceFee = itemsPrice * SERVICE_FEE_PERCENT;

    let shippingPrice;
    if (currency === 'USD') {
      shippingPrice = SHIPPING_FLAT_USD;
    } else {
      const usdToNgnRate = 1 / rates['USD'];
      const shippingInNgn = SHIPPING_FLAT_USD * usdToNgnRate;
      shippingPrice = shippingInNgn * rate;
    }

    const taxPrice = parseFloat(order.taxPrice);

    const itemsPriceLocal = itemsPrice * rate;
    const serviceFeeLocal = serviceFee * rate;
    const taxPriceLocal = taxPrice * rate;

    return itemsPriceLocal + serviceFeeLocal + shippingPrice + taxPriceLocal;
  };

  // --- NEW: pagination helpers
  const totalPages = useMemo(() => {
    const total = Array.isArray(orders) ? orders.length : 0;
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  }, [orders, PAGE_SIZE]);

  // If orders count shrinks (e.g., filter in future), keep page in range
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const paginatedOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    const start = (currentPage - 1) * PAGE_SIZE;
    return orders.slice(start, start + PAGE_SIZE);
  }, [orders, currentPage]);

  // Build a compact list of page numbers (max 7 buttons)
  const pageNumbers = useMemo(() => {
    const maxBtns = 7;
    if (totalPages <= maxBtns) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = new Set([1, totalPages, currentPage]);
    // Surround current with neighbors
    pages.add(currentPage - 1);
    pages.add(currentPage + 1);
    // Also add second/second-last
    pages.add(2);
    pages.add(totalPages - 2);

    // Filter valid and sort
    const sorted = [...pages].filter(p => p >= 1 && p <= totalPages).sort((a, b) => a - b);

    // Insert ellipses markers (-1) where gaps exist
    const withEllipses = [];
    for (let i = 0; i < sorted.length; i++) {
      withEllipses.push(sorted[i]);
      if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) {
        withEllipses.push(-1); // ellipsis
      }
    }
    return withEllipses;
  }, [currentPage, totalPages]);

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
            className="bg-gray-950 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition-colors w-full"
          >
            {loadingUpdateProfile ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
        {loadingUpdateProfile && <Loader />}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-md p-6 w-full lg:w-2/3">
        <div className="flex items-center justify-between border-b pb-2 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            My Orders
          </h2>
          {/* optional: page size display */}
          <span className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">{error?.data?.message || error.error}</Message>
        ) : Array.isArray(orders) && orders.length > 0 ? (
          <>
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
                  {paginatedOrders.map((order) => {
                    const correctTotal = calculateOrderTotal(order);
                    const isDelivered = order.orderStatus === 'delivered';

                    return (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm">{order._id}</td>
                        <td className="px-4 py-2 text-sm">{order.createdAt.substring(0, 10)}</td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">
                          {symbols[currency]} {correctTotal.toFixed(2)}
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

            {/* --- NEW: Pagination controls --- */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}
                {'–'}
                {Math.min(currentPage * PAGE_SIZE, orders.length)} of {orders.length}
              </div>

              <div className="flex items-center gap-1">
                {/* <button
                  className="px-3 py-1 rounded-md border text-sm disabled:opacity-50"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  First
                </button> */}
                <button
                  className="px-3 py-1 rounded-md border text-sm disabled:opacity-50"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Prev
                </button>

                {pageNumbers.map((p, idx) =>
                  p === -1 ? (
                    <span key={`dots-${idx}`} className="px-2 text-gray-500 select-none">…</span>
                  ) : (
                    <button
                      key={p}
                      className={`px-3 py-1 rounded-md border text-sm ${
                        p === currentPage
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => setCurrentPage(p)}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  className="px-3 py-1 rounded-md border text-sm disabled:opacity-50"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
                {/* <button
                  className="px-3 py-1 rounded-md border text-sm disabled:opacity-50"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Last
                </button> */}
              </div>
            </div>
          </>
        ) : (
          <Message>You have no orders yet.</Message>
        )}
      </div>
    </div>
  );
};

export default ProfileScreen;
