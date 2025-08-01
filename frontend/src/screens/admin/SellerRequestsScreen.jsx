import { useState } from 'react'
import {
  useGetSellerRequestsQuery,
  useApproveSellerMutation,
  useDeclineSellerMutation,        // new
} from '../../slices/usersApiSlice'
import { toast } from 'react-toastify'
import Loader from '../../components/Loader'
import { FaCheck, FaTimes } from 'react-icons/fa'  // import FaTimes

const SellerRequestsScreen = () => {
  const { data: requests, isLoading, refetch } = useGetSellerRequestsQuery()
  const [approveSeller] = useApproveSellerMutation()
  const [declineSeller] = useDeclineSellerMutation()     // new
  const [selectedArtist, setSelectedArtist] = useState(null)

  const handleApprove = async id => {
    try {
      await approveSeller(id).unwrap()
      toast.success('✅ Seller approved!')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || err.error)
    }
  }

  const handleDecline = async id => {
    try {
      await declineSeller(id).unwrap()
      toast.info('❌ Seller request declined')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || err.error)
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 my-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Pending Seller Requests
        </h1>
        <p className="text-sm text-gray-600">
          {requests?.length ? `Total: ${requests.length}` : ''}
        </p>
      </div>

      {isLoading ? (
        <Loader />
      ) : requests?.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No pending requests.</p>
          <p className="text-gray-400 text-sm mt-2">Sellers you approve will appear here.</p>
        </div>
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
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Bio</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Location</th>
                    <th className="py-4 px-6 text-center text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {requests.map(u => (
                    <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <img
                          src={u.artistProfile?.photo || '/images/default-artist.png'}
                          alt={u.name}
                          className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-sm"
                        />
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-900">{u.name}</td>
                      <td className="py-4 px-6 text-gray-600">{u.artistProfile?.bio || '—'}</td>
                      <td className="py-4 px-6 text-gray-600">{u.artistProfile?.location || '—'}</td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => setSelectedArtist(u)}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleApprove(u._id)}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => handleDecline(u._id)}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tablet Cards */}
          <div className="hidden md:block lg:hidden">
            <div className="grid gap-4">
              {requests.map(u => (
                <div
                  key={u._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center gap-4"
                >
                  <img
                    src={u.artistProfile?.photo || '/images/default-artist.png'}
                    alt={u.name}
                    className="w-16 h-16 rounded-full object-cover border border-gray-200 shadow-sm flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">{u.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{u.artistProfile?.bio || 'No bio'}</p>
                    <p className="mt-2 text-sm text-gray-500">{u.artistProfile?.location || 'No location'}</p>
                  </div>
                  <div className="flex-shrink-0 flex gap-2">
                    <button
                      onClick={() => setSelectedArtist(u)}
                      className="w-9 h-9 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleApprove(u._id)}
                      className="w-9 h-9 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center"
                    >
                      <FaCheck />
                    </button>
                    <button
                      onClick={() => handleDecline(u._id)}
                      className="w-9 h-9 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden">
            <div className="grid gap-4">
              {requests.map(u => (
                <div
                  key={u._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex flex-col sm:flex-row gap-3"
                >
                  <img
                    src={u.artistProfile?.photo || '/images/default-artist.png'}
                    alt={u.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border border-gray-200 shadow-sm"
                  />
                  <div className="flex-1">
                    <h3 className="text-base font-medium text-gray-900 truncate">{u.name}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{u.artistProfile?.bio || 'No bio'}</p>
                    <p className="text-sm text-gray-500 mt-1">{u.artistProfile?.location || 'No location'}</p>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => setSelectedArtist(u)}
                        className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-md"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleApprove(u._id)}
                        className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-xs rounded-md"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleDecline(u._id)}
                        className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-xs rounded-md"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Modal with artist info */}
      {selectedArtist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setSelectedArtist(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
            >
              ✕
            </button>
            {selectedArtist.artistProfile?.photo ? (
              <img
                src={selectedArtist.artistProfile.photo}
                alt={selectedArtist.name}
                className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-gray-200 mb-4"
              />
            ) : (
              <div className="w-32 h-32 mx-auto rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mb-4">
                No Photo
              </div>
            )}
            <h2 className="text-xl font-bold text-center mb-2">{selectedArtist.name}</h2>
            <p className="text-center text-sm text-gray-500 mb-4">{selectedArtist.email}</p>
            <div className="space-y-3 text-gray-700 text-sm">
              <p>
                <span className="font-semibold">Bio:</span>{' '}
                {selectedArtist.artistProfile?.bio || 'No bio provided'}
              </p>
              <p>
                <span className="font-semibold">Artist Statement:</span>{' '}
                {selectedArtist.artistProfile?.artistStatement || 'No statement'}
              </p>
              <p>
                <span className="font-semibold">Location:</span>{' '}
                {selectedArtist.artistProfile?.location || 'No location'}
              </p>
            </div>
            <div className="mt-6 text-center">
              <button
                onClick={() => setSelectedArtist(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SellerRequestsScreen
