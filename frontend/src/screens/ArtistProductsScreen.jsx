// src/screens/ArtistProductsScreen.jsx
import { FaEdit } from 'react-icons/fa';
import { Link, useParams } from 'react-router-dom';
import Message from '../components/Message';
import Loader from '../components/Loader';
import Paginate from '../components/Paginate';
import { toast } from 'react-toastify';
import { useState } from 'react';
import { useSelector } from 'react-redux';

import {
  useGetProductsByArtistQuery,
  useUpdateProductDiscountMutation,
} from '../slices/productsApiSlice';

const ArtistProductsScreen = () => {
  const { pageNumber } = useParams();
  const { userInfo } = useSelector((s) => s.auth);

  // Ensure artistId is a string
  const artistId =
    (typeof userInfo?._id === 'string' && userInfo._id) ||
    userInfo?._id?.$oid ||
    (userInfo?._id && userInfo._id.toString && userInfo._id.toString()) ||
    null;

  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [draftDiscount, setDraftDiscount] = useState('');

  // If your slice supports pagination via object args, you can switch to:
  // useGetProductsByArtistQuery({ artistId, pageNumber: Number(pageNumber)||1 }, { skip: !artistId })
  // For your current working signature, we keep it as a single string:
  const { data: productsData = [], isLoading, error, refetch } =
    useGetProductsByArtistQuery(artistId, { skip: !artistId });

  const [updateDiscount, { isLoading: loadingDiscount }] =
    useUpdateProductDiscountMutation();

  // Normalize data shape to an array
  const products = Array.isArray(productsData)
    ? productsData
    : productsData?.products || [];

  // ---------- Helpers ----------

  // base/original to show as the "old" price (falls back to current if no discount)
  const basePriceOf = (p) =>
    Number(p?.originalPrice != null ? p.originalPrice : p?.price || 0);

  // current active price (already discounted server-side)
  const finalPriceOf = (p) => Number(p?.price || 0);

  // percent to display (prefer stored value, else compute from original vs final)
  const discountPercentOf = (p) => {
    if (typeof p?.discountPercent === 'number' && p.discountPercent > 0) {
      return p.discountPercent;
    }
    const base = basePriceOf(p);
    const final = finalPriceOf(p);
    return base > 0 && final < base ? Math.round((1 - final / base) * 100) : 0;
  };

  const formatNaira = (n) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(Number(n || 0));

  // ---------- UI state helpers ----------

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startEdit = (product) => {
    setEditingId(product._id);
    const currentPercent = discountPercentOf(product);
    setDraftDiscount(String(currentPercent));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftDiscount('');
  };

  const saveDiscount = async (id) => {
    const value = Number(draftDiscount);
    if (Number.isNaN(value) || value < 0 || value > 90) {
      toast.error('Enter a valid discount between 0 and 90');
      return;
    }
    try {
      await updateDiscount({ id, discountPercent: Math.round(value) }).unwrap();
      toast.success('✅ Discount updated');
      setEditingId(null);
      setDraftDiscount('');
      refetch(); // also make sure your slice invalidates tags for auto-refetch
    } catch (err) {
      toast.error(err?.data?.message || err.error || 'Failed to update discount');
    }
  };

  if (!userInfo) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <Message variant="info">Please sign in to view your listings.</Message>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 my-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Listings</h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 text-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {(isLoading || loadingDiscount) && <Loader />}

      {error ? (
        <Message variant="danger">{error?.data?.message || error.error}</Message>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block">
            <div className="overflow-hidden rounded-lg shadow-sm border border-gray-200">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Image</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Name</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Base Price</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Discount %</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Final Price</th>
                    <th className="py-4 px-6 text-center text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map((product) => {
                    const isEditing = editingId === product._id;
                    const basePrice = basePriceOf(product);
                    const finalPrice = finalPriceOf(product);
                    const percent = discountPercentOf(product);

                    return (
                      <tr
                        key={product._id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="py-4 px-6">
                          <img
                            src={product.image || '/images/default-product.png'}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm"
                          />
                        </td>

                        <td className="py-4 px-6 font-medium text-gray-900 max-w-xs truncate text-left">
                          <Link to={`/product/${product._id}`} className="hover:underline">
                            {product.name}
                          </Link>
                        </td>

                        {/* Base Price (original if present) */}
                        <td className="py-4 px-6 font-semibold text-gray-900 text-left">
                          {formatNaira(basePrice)}
                        </td>

                        {/* Discount editor / display */}
                        <td className="py-4 px-6 text-left">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                max="90"
                                step="1"
                                value={draftDiscount}
                                onChange={(e) => setDraftDiscount(e.target.value)}
                                className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-500">%</span>
                            </div>
                          ) : (
                            <span className="text-gray-900 font-medium">{percent}%</span>
                          )}
                        </td>

                        {/* Final Price (current price) */}
                        <td className="py-4 px-6 font-semibold text-gray-900 text-left">
                          {formatNaira(finalPrice)}
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center">
                            {isEditing ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => saveDiscount(product._id)}
                                  className="px-3 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="px-3 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => startEdit(product)}
                                className="inline-flex items-center justify-center w-9 h-9 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                                title="Set discount"
                              >
                                <FaEdit className="text-sm" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-4 px-6 text-center text-gray-500">
                        No products match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tablet */}
          <div className="hidden md:block lg:hidden">
            <div className="grid gap-4">
              {filteredProducts.map((product) => {
                const isEditing = editingId === product._id;
                const basePrice = basePriceOf(product);
                const finalPrice = finalPriceOf(product);
                const percent = discountPercentOf(product);

                return (
                  <div
                    key={product._id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                  >
                    <div className="flex items-start space-x-4">
                      <img
                        src={product.image || '/images/default-product.png'}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200 shadow-sm flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-medium text-gray-900 truncate pr-4">
                            <Link to={`/product/${product._id}`} className="hover:underline">
                              {product.name}
                            </Link>
                          </h3>
                          <button
                            onClick={() =>
                              isEditing ? saveDiscount(product._id) : startEdit(product)
                            }
                            className={`inline-flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
                              isEditing
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                            title={isEditing ? 'Save' : 'Set discount'}
                          >
                            <FaEdit className="text-sm" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Base Price:</span>
                            <p className="text-gray-900 font-semibold">
                              {formatNaira(basePrice)}
                            </p>
                          </div>

                          <div>
                            <span className="text-gray-500">Discount %:</span>
                            {isEditing ? (
                              <div className="flex items-center gap-2 mt-1">
                                <input
                                  type="number"
                                  min="0"
                                  max="90"
                                  step="1"
                                  value={draftDiscount}
                                  onChange={(e) => setDraftDiscount(e.target.value)}
                                  className="w-24 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                  onClick={() => saveDiscount(product._id)}
                                  className="px-2 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <p className="text-gray-900 font-medium">{percent}%</p>
                            )}
                          </div>

                          <div>
                            <span className="text-gray-500">Final Price:</span>
                            <p className="text-gray-900 font-semibold">
                              {formatNaira(finalPrice)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile */}
          <div className="md:hidden">
            <div className="grid gap-4">
              {filteredProducts.map((product) => {
                const isEditing = editingId === product._id;
                const basePrice = basePriceOf(product);
                const finalPrice = finalPriceOf(product);
                const percent = discountPercentOf(product);

                return (
                  <div
                    key={product._id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                  >
                    <div className="flex items-start space-x-3">
                      <img
                        src={product.image || '/images/default-product.png'}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-medium text-gray-900 mb-1 line-clamp-2">
                          <Link to={`/product/${product._id}`} className="hover:underline">
                            {product.name}
                          </Link>
                        </h3>

                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm text-gray-500">Base</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {formatNaira(basePrice)}
                            </p>
                            <p className="text-sm text-gray-500">Final</p>
                            <p className="text-base font-semibold text-gray-900">
                              {formatNaira(finalPrice)}
                            </p>
                          </div>

                          <div className="flex-1">
                            <p className="text-sm text-gray-500 mb-1">Discount %</p>
                            {isEditing ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="0"
                                  max="90"
                                  step="1"
                                  value={draftDiscount}
                                  onChange={(e) => setDraftDiscount(e.target.value)}
                                  className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                  onClick={() => saveDiscount(product._id)}
                                  className="px-3 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="px-3 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-900 font-medium">{percent}%</span>
                                <button
                                  onClick={() => startEdit(product)}
                                  className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                                  title="Set discount"
                                >
                                  <FaEdit className="text-xs" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pagination (only if provided by API) */}
          {productsData?.pages && productsData?.page ? (
            <div className="mt-8 flex justify-start">
              <Paginate
                pages={productsData.pages}
                page={productsData.page}
                isAdmin={false}
              />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

export default ArtistProductsScreen;
