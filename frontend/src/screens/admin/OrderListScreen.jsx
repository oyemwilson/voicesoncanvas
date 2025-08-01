// src/pages/admin/OrderListScreen.js
import { useState, useContext } from 'react';
import { FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import { useGetOrdersQuery } from '../../slices/ordersApiSlice';
import { CurrencyContext } from '../../components/CurrencyContext';

const OrderListScreen = () => {
  // Fetch all orders
  const { data: orders = [], isLoading, error } = useGetOrdersQuery();

  // Local search state
  const [searchTerm, setSearchTerm] = useState('');

  // Currency context
  const { currency, rates } = useContext(CurrencyContext);
  const symbols = { NGN: '₦', USD: '$', EUR: '€', GBP: '£', JPY: '¥' };
  const rate = rates[currency] || 1;

  // Filter orders by ID or user name
  const filtered = orders.filter((order) => {
    const term = searchTerm.toLowerCase();
    return (
      order._id.toLowerCase().includes(term) ||
      (order.user?.name || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      {/* Header + Search */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 my-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Orders</h1>
        <input
          type="text"
          placeholder="Search by Order ID or User..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 text-sm w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block">
            <div className="overflow-hidden rounded-lg shadow-sm border border-gray-200">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">ID</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">User</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Total</th>
                    <th className="py-3 px-4 text-center text-sm font-semibold text-gray-900">Paid</th>
                    <th className="py-3 px-4 text-center text-sm font-semibold text-gray-900">Status</th>
                    <th className="py-3 px-4 text-center text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.length > 0 ? (
                    filtered.map((order) => {
                      const isDelivered = order.orderStatus === 'delivered';
                      const isShipped   = order.orderStatus === 'shipped';
                      return (
                        <tr key={order._id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="py-3 px-4 font-mono text-xs text-gray-700">{order._id}</td>
                          <td className="py-3 px-4">{order.user?.name || '—'}</td>
                          <td className="py-3 px-4">{order.createdAt.substring(0, 10)}</td>
                          <td className="py-3 px-4 font-semibold text-gray-900">
                            {symbols[currency]} {(order.totalPrice * rate).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {order.isPaid ? (
                              <span className="text-green-600 font-medium">
                                {order.paidAt.substring(0, 10)}
                              </span>
                            ) : (
                              <FaTimes className="text-red-500 mx-auto" />
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {isDelivered ? (
                              <Message variant="success">
                                Delivered on{' '}
                                {order.deliveredAt
                                  ? new Date(order.deliveredAt).toLocaleDateString()
                                  : '—'}
                              </Message>
                            ) : isShipped ? (
                              <Message variant="info">
                                Shipped on{' '}
                                {order.shippingDetails?.shippedAt
                                  ? new Date(order.shippingDetails.shippedAt).toLocaleDateString()
                                  : '—'}
                              </Message>
                            ) : (
                              <Message variant="warning">Pending Shipment</Message>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Link
                              to={`/order/${order._id}`}
                              className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-1 px-3 rounded-lg text-sm"
                            >
                              Details
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-4 px-4 text-center text-gray-500">
                        No orders match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden grid gap-4">
            {filtered.length > 0 ? (
              filtered.map((order) => {
                const isDelivered = order.orderStatus === 'delivered';
                const isShipped   = order.orderStatus === 'shipped';
                return (
                  <div
                    key={order._id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <p className="text-sm text-gray-500">Order ID</p>
                        <p className="font-mono text-xs font-medium text-gray-800 break-all">
                          {order._id}
                        </p>
                      </div>
                      <Link
                        to={`/order/${order._id}`}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm px-3 py-1 rounded-lg"
                      >
                        Details
                      </Link>
                    </div>

                    <div className="flex justify-between mb-2">
                      <p className="text-sm text-gray-500">User</p>
                      <p className="text-sm font-medium text-gray-900">
                        {order.user?.name || '—'}
                      </p>
                    </div>

                    <div className="flex justify-between mb-2">
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {order.createdAt.substring(0, 10)}
                      </p>
                    </div>

                    <div className="flex justify-between mb-2">
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {symbols[currency]} {(order.totalPrice * rate).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex justify-between mb-2">
                      <p className="text-sm text-gray-500">Paid</p>
                      {order.isPaid ? (
                        <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          {order.paidAt.substring(0, 10)}
                        </span>
                      ) : (
                        <span className="text-xs font-medium bg-red-100 text-red-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <FaTimes /> Not Paid
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between">
                      <p className="text-sm text-gray-500">Status</p>
                      {isDelivered ? (
                        <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          Delivered {order.deliveredAt?.substring(0, 10)}
                        </span>
                      ) : isShipped ? (
                        <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          Shipped {order.shippingDetails?.shippedAt?.substring(0, 10)}
                        </span>
                      ) : (
                        <span className="text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                          Pending Shipment
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-500">No orders match your search.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default OrderListScreen;
