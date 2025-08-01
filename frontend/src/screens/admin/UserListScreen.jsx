import React, { useState } from 'react';
import { FaTrash, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import Paginate from '../../components/Paginate';
import {
  useDeleteUserMutation,
  useGetUsersQuery,
} from '../../slices/usersApiSlice';
import { toast } from 'react-toastify';

const UserListScreen = () => {
  const { data: users, refetch, isLoading, error } = useGetUsersQuery();
  const [deleteUser] = useDeleteUserMutation();

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10); // You can make this configurable

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id).unwrap();
        toast.success('✅ User deleted');
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  // Filter users
  let filteredUsers = users
    ? users.filter((user) => {
        if (filter === 'sellers') return user.isSeller;
        if (filter === 'buyers') return !user.isSeller;
        return true;
      })
    : [];

  // Search users
  if (search.trim() !== '') {
    filteredUsers = filteredUsers.filter((user) =>
      user.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Calculate pagination
  const totalUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalUsers / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to first page when filter or search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filter, search]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 ps-0 pe-0 lg:px-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 my-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Users</h1>
          {!isLoading && (
            <p className="text-sm text-gray-600 mt-1">
              Showing {currentUsers.length} of {totalUsers} users
              {(filter !== 'all' || search.trim() !== '') && (
                <span className="ml-1">
                  {filter !== 'all' && `(filtered by ${filter})`}
                  {search.trim() !== '' && `(search: "${search}")`}
                </span>
              )}
            </p>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm w-full md:w-64"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Users</option>
            <option value="sellers">Sellers</option>
            <option value="buyers">Buyers</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error?.data?.message || error.error}</Message>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block">
            <div className="overflow-hidden rounded-lg shadow-sm border border-gray-200">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Photo</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Name</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="py-4 px-6 text-center text-sm font-semibold text-gray-900">Admin</th>
                    <th className="py-4 px-6 text-center text-sm font-semibold text-gray-900">Seller</th>
                    <th className="py-4 px-6 text-center text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 ">
                        <img
                          src={
                            user.artistProfile?.photo ||
                            '/images/default-artist.png'
                          }
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-sm"
                        />
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-900 text-left">{user.name}</td>
                      <td className="py-4 px-6 text-left">
                        <a href={`mailto:${user.email}`} className="text-blue-500 hover:underline">
                          {user.email}
                        </a>
                      </td>
                      <td className="py-4 px-6 text-centertext-left ">
                        {user.isAdmin ? (
                          <FaCheck className="text-green-500 mx-auto" />
                        ) : (
                          <FaTimes className="text-red-500 mx-auto" />
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {user.isSeller ? (
                          <FaCheck className="text-green-500 mx-auto" />
                        ) : (
                          <FaTimes className="text-red-500 mx-auto" />
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center gap-2">
                          {!user.isAdmin && (
                            <>
                              <Link
                                to={`/admin/user/${user._id}/edit`}
                                className="inline-flex items-center justify-center w-9 h-9 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                              >
                                <FaEdit className="text-sm" />
                              </Link>
                              <button
                                onClick={() => deleteHandler(user._id)}
                                className="inline-flex items-center justify-center w-9 h-9 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                              >
                                <FaTrash className="text-sm" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tablet view */}
          <div className="hidden md:block lg:hidden">
            <div className="grid gap-4">
              {currentUsers.map((user) => (
                <div
                  key={user._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center gap-4"
                >
                  <img
                    src={user.artistProfile?.photo || '/images/default-artist.png'}
                    alt={user.name}
                    className="w-16 h-16 rounded-full object-cover border border-gray-200 shadow-sm flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">{user.name}</h3>
                    <a
                      href={`mailto:${user.email}`}
                      className="text-sm text-blue-500 hover:underline"
                    >
                      {user.email}
                    </a>
                    <div className="mt-2 flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        Admin: {user.isAdmin ? <FaCheck className="text-green-500" /> : <FaTimes className="text-red-500" />}
                      </span>
                      <span className="flex items-center gap-1">
                        Seller: {user.isSeller ? <FaCheck className="text-green-500" /> : <FaTimes className="text-red-500" />}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex gap-2">
                    {!user.isAdmin && (
                      <>
                        <Link
                          to={`/admin/user/${user._id}/edit`}
                          className="inline-flex items-center justify-center w-9 h-9 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                        >
                          <FaEdit className="text-sm" />
                        </Link>
                        <button
                          onClick={() => deleteHandler(user._id)}
                          className="inline-flex items-center justify-center w-9 h-9 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile view */}
          <div className="md:hidden">
            <div className="grid gap-4">
              {currentUsers.map((user) => (
                <div
                  key={user._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4"
                >
                  {/* Mobile card header with image and basic info */}
                  <div className="flex gap-3 items-start">
                    <img
                      src={user.artistProfile?.photo || '/images/default-artist.png'}
                      alt={user.name}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border border-gray-200 shadow-sm flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate">{user.name}</h3>
                      <a
                        href={`mailto:${user.email}`}
                        className="text-xs sm:text-sm text-blue-500 hover:underline block truncate"
                      >
                        {user.email}
                      </a>
                    </div>
                    {/* Actions in top right */}
                    {!user.isAdmin && (
                      <div className="flex-shrink-0 flex gap-1">
                        <Link
                          to={`/admin/user/${user._id}/edit`}
                          className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                        >
                          <FaEdit className="text-xs" />
                        </Link>
                        <button
                          onClick={() => deleteHandler(user._id)}
                          className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Status badges below */}
                  <div className="mt-3 flex flex-wrap gap-2 text-xs sm:text-sm">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-full">
                      {user.isAdmin ? '✅ Admin' : '❌ Not Admin'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-full">
                      {user.isSeller ? '✅ Seller' : '❌ Buyer'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* No users message */}
          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No users match this search or filter.</p>
              <p className="text-gray-400 text-sm mt-2">
                Try adjusting your search terms or filter options.
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Paginate
                pages={totalPages}
                page={currentPage}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserListScreen;