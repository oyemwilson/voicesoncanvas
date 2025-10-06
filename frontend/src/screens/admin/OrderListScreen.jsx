// src/pages/admin/OrderListScreen.js
import { useState, useContext, useMemo, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import { useGetOrdersQuery } from '../../slices/ordersApiSlice';
import { CurrencyContext } from '../../components/CurrencyContext';

const OrderListScreen = () => {
  // Fetch all orders (client-side sort + pagination)
  const { data: orders = [], isLoading, error } = useGetOrdersQuery();

  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // --- NEW: sort
  // options: '', 'paid', 'shipped', 'pending', 'not_paid'
  const [sortBy, setSortBy] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 12;

  // Currency context
  const { currency, rates } = useContext(CurrencyContext);
  const symbols = { NGN: '₦', USD: '$', EUR: '€', GBP: '£', JPY: '¥' };
  const rate = rates[currency] || 1;

  // Pricing constants
  const SERVICE_FEE_PERCENT = 0.05;
  const SHIPPING_FLAT_USD = 35;

  const calculateOrderTotal = (order) => {
    const itemsPrice = parseFloat(order.itemsPrice || 0);
    const serviceFee = itemsPrice * SERVICE_FEE_PERCENT;

    let shippingPrice;
    if (currency === 'USD') {
      shippingPrice = SHIPPING_FLAT_USD;
    } else {
      const usdToNgnRate = 1 / (rates['USD'] || 1);
      const shippingInNgn = SHIPPING_FLAT_USD * usdToNgnRate;
      shippingPrice = shippingInNgn * rate;
    }

    const taxPrice = parseFloat(order.taxPrice || 0);

    const itemsPriceLocal = itemsPrice * rate;
    const serviceFeeLocal = serviceFee * rate;
    const taxPriceLocal = taxPrice * rate;

    return itemsPriceLocal + serviceFeeLocal + shippingPrice + taxPriceLocal;
  };

  // --- NEW: Normalize status for sorting
  // buckets: 'paid' | 'shipped' | 'pending' | 'not_paid'
  const getStatusBucket = (order) => {
    const isDelivered = order.orderStatus === 'delivered';
    const isShipped = order.orderStatus === 'shipped' || !!order.shippingDetails?.shippedAt;

    // Paid/Not paid is independent of shipped/pending;
    // but user wants to sort explicitly by each bucket.
    if (sortBy === 'paid' || sortBy === 'not_paid') {
      return order.isPaid ? 'paid' : 'not_paid';
    }

    // For shipped/pending, consider delivered as shipped (already dispatched)
    if (isShipped || isDelivered) return 'shipped';
    return 'pending';
  };

  // Search filter
  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return orders;
    return orders.filter((order) => {
      return (
        order._id.toLowerCase().includes(term) ||
        (order.user?.name || '').toLowerCase().includes(term)
      );
    });
  }, [orders, searchTerm]);

  // --- NEW: Sorting (selected bucket first, then newest)
  const sorted = useMemo(() => {
    if (!sortBy) {
      // default sort: newest first
      return [...filtered].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }

    const preferred = sortBy; // 'paid' | 'shipped' | 'pending' | 'not_paid'
    return [...filtered].sort((a, b) => {
      const aBucket = getStatusBucket(a);
      const bBucket = getStatusBucket(b);

      // put preferred bucket first
      const aRank = aBucket === preferred ? 0 : 1;
      const bRank = bBucket === preferred ? 0 : 1;
      if (aRank !== bRank) return aRank - bRank;

      // within bucket: newest first
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [filtered, sortBy]);

  // Pagination derived from sorted results
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((sorted?.length || 0) / PAGE_SIZE)),
    [sorted, PAGE_SIZE]
  );

  // Reset page when search/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, currentPage]);

  // Page numbers (with ellipses)
  const pageNumbers = useMemo(() => {
    const maxBtns = 7;
    if (totalPages <= maxBtns) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const s = new Set([1, 2, totalPages - 1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
    const sortedPages = [...s].filter(p => p >= 1 && p <= totalPages).sort((a, b) => a - b);
    const withDots = [];
    for (let i = 0; i < sortedPages.length; i++) {
      withDots.push(sortedPages[i]);
      if (i < sortedPages.length - 1 && sortedPages[i + 1] - sortedPages[i] > 1) withDots.push(-1);
    }
    return withDots;
  }, [currentPage, totalPages]);

  const renderPagination = () => {
    if (!sorted || sorted.length === 0) return null;
    const showingFrom = (currentPage - 1) * PAGE_SIZE + 1;
    const showingTo = Math.min(currentPage * PAGE_SIZE, sorted.length);

    return (
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-sm text-gray-600">
          Showing {showingFrom}–{showingTo} of {sorted.length}
          {searchTerm ? ' (filtered)' : ''}
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
                  p === currentPage ? 'bg-gray-900 text-white border-gray-900' : 'hover:bg-gray-100'
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
    );
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      {/* Header: Title + Search + Sort */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3 my-6">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Orders</h1>
          <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <input
            type="text"
            placeholder="Search by Order ID or User..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 text-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* --- NEW: Sort select --- */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Sort orders by status"
          >
            <option value="">Sort: Newest first (default)</option>
            <option value="paid">Paid first</option>
            <option value="shipped">Shipped first</option>
            <option value="pending">Pending Shipment first</option>
            <option value="not_paid">Not Paid first</option>
          </select>
        </div>
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
                  {paginated.length > 0 ? (
                    paginated.map((order) => {
                      const isDelivered = order.orderStatus === 'delivered';
                      const isShipped   = order.orderStatus === 'shipped';
                      const correctTotal = calculateOrderTotal(order);

                      return (
                        <tr key={order._id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="py-3 px-4 font-mono text-xs text-gray-700">{order._id}</td>
                          <td className="py-3 px-4">{order.user?.name || '—'}</td>
                          <td className="py-3 px-4">{order.createdAt.substring(0, 10)}</td>
                          <td className="py-3 px-4 font-semibold text-gray-900">
                            {symbols[currency]} {correctTotal.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {order.isPaid ? (
                              <span className="text-green-600 font-medium">
                                {order.paidAt?.substring(0, 10)}
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
                        No orders {searchTerm ? 'match your search' : 'found'}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden grid gap-4">
            {paginated.length > 0 ? (
              paginated.map((order) => {
                const isDelivered = order.orderStatus === 'delivered';
                const isShipped   = order.orderStatus === 'shipped';
                const correctTotal = calculateOrderTotal(order);

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
                        {symbols[currency]} {correctTotal.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex justify-between mb-2">
                      <p className="text-sm text-gray-500">Paid</p>
                      {order.isPaid ? (
                        <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          {order.paidAt?.substring(0, 10)}
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
              <p className="text-center text-gray-500">
                No orders {searchTerm ? 'match your search' : 'found'}.
              </p>
            )}
          </div>

          {/* Pagination */}
          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default OrderListScreen;
