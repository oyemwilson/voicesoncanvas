import { useState } from 'react';
import { useGetUsersQuery, useToggleFeaturedArtistMutation } from '../../slices/usersApiSlice';
import { toast } from 'react-toastify';

const AdminFeaturedArtists = () => {
  const { data: users, isLoading } = useGetUsersQuery();
  const [toggleFeaturedArtist] = useToggleFeaturedArtistMutation();

  // ✅ search and pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ✅ sellers only
  const sellers = users?.filter((u) => u.isSeller) || [];

  // ✅ search filter
  const filteredArtists = sellers.filter((artist) =>
    artist.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentArtists = filteredArtists.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredArtists.length / itemsPerPage);

  const handleToggle = async (id) => {
    try {
      await toggleFeaturedArtist(id).unwrap();
      toast.success('✅ Artist feature status updated');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Manage Featured Artists</h1>

      {/* 🔎 Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by artist name..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full sm:w-80 border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : filteredArtists.length === 0 ? (
        <p className="text-gray-500">No artists found.</p>
      ) : (
        <>
          {/* ✅ Desktop Table */}
          <div className="hidden md:block overflow-x-auto rounded-lg shadow-sm border border-gray-200">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Photo</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="py-3 px-4 text-center text-sm font-semibold text-gray-900">Featured?</th>
                  <th className="py-3 px-4 text-center text-sm font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentArtists.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-3 px-4">
                      <img
                        src={
                          u.artistProfile?.photo
                            ? u.artistProfile.photo
                            : '/images/default-artist.png'
                        }
                        alt={u.name}
                        className="w-12 h-12 rounded-full object-cover border shadow-sm"
                      />
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-800">{u.name}</td>
                    <td className="py-3 px-4 text-center">
                      {u.isFeaturedArtist ? '✅' : '❌'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggle(u._id)}
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                      >
                        Toggle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ✅ Mobile Cards */}
          <div className="grid md:hidden gap-4">
            {currentArtists.map((u) => (
              <div
                key={u._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center gap-4"
              >
                <img
                  src={
                    u.artistProfile?.photo
                      ? u.artistProfile.photo
                      : '/images/default-artist.png'
                  }
                  alt={u.name}
                  className="w-16 h-16 rounded-full object-cover border shadow-sm flex-shrink-0"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-800">{u.name}</h3>
                  <p className="text-sm mt-1">
                    Featured:{" "}
                    {u.isFeaturedArtist ? (
                      <span className="text-green-600 font-semibold">Yes</span>
                    ) : (
                      <span className="text-red-600 font-semibold">No</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => handleToggle(u._id)}
                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors"
                >
                  Toggle
                </button>
              </div>
            ))}
          </div>

          {/* 📌 Pagination Controls */}
          <div className="flex justify-start mt-6 gap- flex-wrap">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-4 py-2 border border-gray-300 font-medium ${
                  currentPage === index + 1
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminFeaturedArtists;
