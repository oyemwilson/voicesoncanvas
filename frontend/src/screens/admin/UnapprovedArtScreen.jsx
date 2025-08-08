import { useState, useEffect } from 'react'
import {
  useGetUnapprovedProductsQuery,
  useApproveProductMutation,
  useDeclineProductMutation,    // ← new
} from '../../slices/productsApiSlice'
import { toast } from 'react-toastify'
import Loader from '../../components/Loader'
import { FaTimes } from 'react-icons/fa'   // decline icon

const UnapprovedArtScreen = () => {
  const { data: products = [], isLoading, error, refetch } =
    useGetUnapprovedProductsQuery()
  const [approveProduct] = useApproveProductMutation()
  const [declineProduct] = useDeclineProductMutation()    // ← new
  const [selectedProduct, setSelectedProduct] = useState(null)

  const handleApprove = async (id) => {
    try {
      await approveProduct(id).unwrap()
      toast.success('✅ Product approved successfully')
      refetch()
      setSelectedProduct(null)
    } catch (err) {
      toast.error(err?.data?.message || err.error)
    }
  }

    // when selectedProduct changes, reset back to first image
  const [activeIndex, setActiveIndex] = useState(0);
  useEffect(() => {
    setActiveIndex(0);
  }, [selectedProduct]);

  // build a single array of all your images
  const allImages = selectedProduct
    ? [selectedProduct.image, ...(selectedProduct.images || [])]
    : []; 
  const handleDecline = async (id) => {
    try {
      await declineProduct(id).unwrap()
      toast.info('❌ Product declined')
      refetch()
      setSelectedProduct(null)
    } catch (err) {
      toast.error(err?.data?.message || err.error)
    }
  }

  const closeModal = () => setSelectedProduct(null)

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 my-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          🖼️ Unapproved Art
        </h1>
        {!isLoading && (
          <p className="text-sm text-gray-600">
            {products.length > 0 && `Total: ${products.length}`}
          </p>
        )}
      </div>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <p className="text-red-500">{error?.data?.message || error.error}</p>
      ) : products.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No unapproved artworks.</p>
          <p className="text-gray-400 text-sm mt-2">
            Approved or declined artworks will disappear from this list.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block">
            <div className="overflow-hidden rounded-lg shadow-sm border border-gray-200">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">
                      Image
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">
                      Art Name
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">
                      Artist
                    </th>
                    <th className="py-4 px-6 text-center text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((prod) => (
                    <tr key={prod._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <img
                          src={prod.image || '/images/default-art.png'}
                          alt={prod.name}
                          className="w-16 h-16 rounded-md object-cover border border-gray-200 shadow-sm"
                        />
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-900">
                        {prod.name}
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {prod.user?.name || '—'}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => setSelectedProduct(prod)}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleApprove(prod._id)}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleDecline(prod._id)}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
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
              {products.map((prod) => (
                <div
                  key={prod._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center gap-4"
                >
                  <img
                    src={prod.image || '/images/default-art.png'}
                    alt={prod.name}
                    className="w-16 h-16 rounded-md object-cover border border-gray-200 shadow-sm flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {prod.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {prod.user?.name || 'Unknown Artist'}
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex gap-2">
                    <button
                      onClick={() => setSelectedProduct(prod)}
                      className="inline-flex items-center justify-center w-9 h-9 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleApprove(prod._id)}
                      className="inline-flex items-center justify-center w-9 h-9 bg-green-500 hover:bg-green-600 text-white rounded-lg"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => handleDecline(prod._id)}
                      className="inline-flex items-center justify-center w-9 h-9 bg-red-500 hover:bg-red-600 text-white rounded-lg"
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
              {products.map((prod) => (
                <div
                  key={prod._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 flex flex-col sm:flex-row gap-3"
                >
                  <img
                    src={prod.image || '/images/default-art.png'}
                    alt={prod.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-md object-cover border border-gray-200 shadow-sm flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate">
                      {prod.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      {prod.user?.name || 'Unknown Artist'}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => setSelectedProduct(prod)}
                        className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-md"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleApprove(prod._id)}
                        className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-xs rounded-md"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleDecline(prod._id)}
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

      {/* Modal */}
{selectedProduct && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 relative overflow-y-auto max-h-[90vh]">

      {/* close button, title, etc. */}

      {/* IMAGE GALLERY */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* MAIN DISPLAY */}
        <div className="md:w-1/2">
          <img
            src={allImages[activeIndex]}
            alt={`${selectedProduct.name} #${activeIndex + 1}`}
            className="w-full h-64 object-cover rounded-lg"
          />

          {/* THUMBNAILS */}
          {allImages.length > 1 && (
            <div className="mt-2 flex space-x-2 overflow-x-auto">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`w-20 h-20 rounded-lg overflow-hidden 
                    ${i === activeIndex ? 'ring-2 ring-yellow-500' : ''}
                  `}
                >
                  <img
                    src={img}
                    alt={`${selectedProduct.name} thumb ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Artwork details */}
        <div className="md:w-1/2 space-y-2">
          <p className="text-gray-700">{selectedProduct.description}</p>
          <p>
            <strong>Category:</strong> {selectedProduct.category}
          </p>
          <p>
            <strong>Type:</strong> {selectedProduct.type}
          </p>
          <p>
            <strong>Medium:</strong> {selectedProduct.medium}
          </p>
          <p>
            <strong>Style:</strong> {selectedProduct.style}
          </p>
          <p>
            <strong>Price:</strong> {selectedProduct.currency} {selectedProduct.price.toLocaleString()}
          </p>
          <p>
            <strong>Stock:</strong> {selectedProduct.countInStock}
          </p>
          <p>
            <strong>Weight:</strong> {selectedProduct.weight} kg
          </p>
 <p>
   <strong>Framed:</strong>{' '}
   {(selectedProduct.isFramed ?? selectedProduct.framed) ? 'Yes' : 'No'}
 </p>
          {selectedProduct.tags.length > 0 && (
            <p>
              <strong>Tags:</strong>{' '}
              {selectedProduct.tags.map((t) => (
                <span key={t} className="inline-block bg-gray-200 text-gray-800 px-2 py-1 rounded mr-1 text-sm">
                  {t}
                </span>
              ))}
            </p>
          )}
          {selectedProduct.specifications.length > 0 && (
            <div>
              <strong>Specifications:</strong>
              <ul className="list-disc list-inside">
                {selectedProduct.specifications.map((spec, i) => (
                  <li key={i}>
                    {spec.key}: {spec.value}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <hr className="my-6" />

      {/* Artist info */}
      <h3 className="text-xl font-semibold mb-3">Artist Profile</h3>
      <div className="flex items-start gap-4">
        <img
          src={selectedProduct.user.artistProfile.photo}
          alt={selectedProduct.user.name}
          className="w-20 h-20 object-cover rounded-full"
        />
        <div>
          <p className="font-bold">{selectedProduct.user.name}</p>
          <p className="text-gray-600 mb-2">
            <strong>Location:</strong> {selectedProduct.user.artistProfile.location}
          </p>
          <p className="italic mb-2">“{selectedProduct.user.artistProfile.artistStatement}”</p>
          <p>{selectedProduct.user.artistProfile.bio}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={closeModal}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
        >
          Close
        </button>
        {!selectedProduct.approved ? (
          <button
            onClick={() => handleApprove(selectedProduct._id)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Approve
          </button>
        ) : (
          <span className="self-center text-sm text-green-700 font-semibold">Already Approved</span>
        )}
        <button
          onClick={() => handleDecline(selectedProduct._id)}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Decline
        </button>
      </div>
    </div>
  </div>
)}

  
    </div>
  )
}

export default UnapprovedArtScreen
