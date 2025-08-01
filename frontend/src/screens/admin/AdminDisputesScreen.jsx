import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Loader2, Eye, Filter } from 'lucide-react';
import { useGetDisputesQuery } from '../../slices/ordersApiSlice';
import Message from '../../components/Message';
import Loader from '../../components/Loader';

/**
 * AdminDisputesScreen
 * -------------------------------------------------
 * Lists all disputes in a sortable/filterable table so an admin can quickly
 * triage and drill‑down into each dispute.
 *
 * ‣ Fetches disputes via `useGetDisputesQuery` (expects /api/orders/disputes).
 * ‣ Filter by status (open, in_review, resolved, closed).
 * ‣ Click eye icon to navigate to the order detail screen.
 */
const AdminDisputesScreen = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [statusFilter, setStatusFilter] = useState('all');

  // RTK‑Query call (you'll create this endpoint in ordersApiSlice)
  const {
    data: disputes = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetDisputesQuery();

  const filtered =
    statusFilter === 'all'
      ? disputes
      : disputes.filter((d) => d.dispute.status === statusFilter);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Disputes</h1>
        <button
          onClick={refetch}
          className="flex items-center bg-black text-white py-2 px-4 rounded hover:bg-gray-300"
        >
          Refresh
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center mb-4 space-x-3">
        <Filter className="w-5 h-5 text-gray-600" />
        {['all', 'open', 'resolved', ].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`py-1 px-3 rounded-full text-sm capitalize ${
              statusFilter === s
                ? 'bg-black text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <Loader />
      ) : isError ? (
        <Message variant="danger">{error?.data?.message || error.error}</Message>
      ) : filtered.length === 0 ? (
        <Message>No disputes found</Message>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Opened By</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr
                  key={d._id}
                  className="border-b last:border-b-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-mono">#{d._id.slice(-8)}</td>
                  <td className="px-4 py-3 capitalize">{d.dispute.reason.replace('_', ' ')}</td>
                  <td className="px-4 py-3">{d.dispute.createdBy?.name || '—'}</td>
                  <td className="px-4 py-3 capitalize font-semibold">
                    <span
                      className={`py-1 px-2 rounded-full text-xs ${
                        d.dispute.status === 'open'
                          ? 'bg-red-100 text-red-700'
                          : d.dispute.status === 'in_review'
                          ? 'bg-yellow-100 text-yellow-800'
                          : d.dispute.status === 'resolved'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {d.dispute.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => navigate(`/order/${d._id}`)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDisputesScreen;
