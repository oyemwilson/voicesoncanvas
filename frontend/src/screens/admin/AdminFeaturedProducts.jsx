import { useState } from 'react';
import { useGetProductsQuery, useToggleFeaturedProductMutation } from '../../slices/productsApiSlice';
import { toast } from 'react-toastify';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import Paginate from '../../components/Paginate';

const AdminFeaturedProducts = () => {
  const { data, isLoading, error, refetch } = useGetProductsQuery({ keyword: '', pageNumber: 1 });
  const products = data?.products || [];
  const [toggleFeatured, { isLoading: toggling }] = useToggleFeaturedProductMutation();

  // 🔎 SEARCH STATE
  const [searchTerm, setSearchTerm] = useState('');

  // ✅ FILTER PRODUCTS BY SEARCH
  const filteredProducts = products.filter((p) => {
    const lowerSearch = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(lowerSearch) ||
      (p.user?.name && p.user.name.toLowerCase().includes(lowerSearch))
    );
  });

  const handleToggle = async (id) => {
    try {
      await toggleFeatured(id).unwrap();
      toast.success('✅ Product feature status updated');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 my-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Manage Featured Products
        </h1>
        {/* 🔎 Search Bar */}
        <input
          type="text"
          placeholder="Search by product or artist..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 text-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error?.data?.message || error.error}</Message>
      ) : (
        <>
          {/* ✅ Table view for larger screens */}
          <div className="hidden md:block">
            <div className="overflow-hidden rounded-lg shadow-sm border border-gray-200">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Artwork</th>
                    <th className="py-3 px-4 text-center text-sm font-semibold text-gray-900">Featured?</th>
                    <th className="py-3 px-4 text-center text-sm font-semibold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-4">
                          <img
                            src={p.image || '/images/default-product.png'}
                            alt={p.name}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{p.name}</div>
                            <div className="text-sm text-gray-500">
                              {p.user?.name || 'Unknown Artist'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {p.isFeatured ? (
                          <span className="text-green-600 font-bold">Yes ✅</span>
                        ) : (
                          <span className="text-red-500 font-bold">No ❌</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleToggle(p._id)}
                          className="inline-flex items-center justify-center px-3 py-2 bg-green-500 hover:bg-green-600  text-white text-sm font-medium rounded-md shadow-sm transition-colors duration-200 disabled:opacity-50"
                          disabled={toggling}
                        >
                          Toggle
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan="3" className="py-4 px-4 text-center text-gray-500">
                        No products match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ✅ Mobile card view */}
          <div className="md:hidden grid gap-4">
            {filteredProducts.map((p) => (
              <div key={p._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-start space-x-4">
                  <img
                    src={p.image || '/images/default-product.png'}
                    alt={p.name}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200 shadow-sm flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-gray-900 mb-1">{p.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">
                      {p.user?.name || 'Unknown Artist'}
                    </p>
                    <p className="text-sm mb-3">
                      <span className="font-semibold">Featured:</span>{' '}
                      {p.isFeatured ? (
                        <span className="text-green-600 font-bold">Yes ✅</span>
                      ) : (
                        <span className="text-red-500 font-bold">No ❌</span>
                      )}
                    </p>
                    <button
                      onClick={() => handleToggle(p._id)}
                      className="inline-flex items-center justify-center w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors duration-200 disabled:opacity-50"
                      disabled={toggling}
                    >
                      Toggle Featured
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <p className="text-center text-gray-500">No products match your search.</p>
            )}
          </div>

          {/* ✅ Pagination */}
          <div className="mt-8 flex justify-start">
            <Paginate pages={data.pages} page={data.page} isAdmin={true} />
          </div>
        </>
      )}
    </div>
  );
};

export default AdminFeaturedProducts;
