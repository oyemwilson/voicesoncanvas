import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import { Link, useParams } from 'react-router-dom';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import Paginate from '../../components/Paginate';
import {
  useGetProductsQuery,
  useDeleteProductMutation,
  useCreateProductMutation,
} from '../../slices/productsApiSlice';
import { toast } from 'react-toastify';
import { useState } from 'react';

const ProductListScreen = () => {
  const { pageNumber } = useParams();

  const { data, isLoading, error, refetch } = useGetProductsQuery({
    pageNumber,
  });

  const [deleteProduct, { isLoading: loadingDelete }] = useDeleteProductMutation();
  const [createProduct, { isLoading: loadingCreate }] = useCreateProductMutation();

  // 🔎 Search state
  const [searchTerm, setSearchTerm] = useState('');

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id).unwrap();
        toast.success('✅ Product deleted');
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const createProductHandler = async () => {
    if (window.confirm('Create a new blank product?')) {
      try {
        await createProduct().unwrap();
        toast.success('✅ Product created');
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  // ✅ Filter products by search term
  const products = data?.products || [];
  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      (p.category && p.category.toLowerCase().includes(term))
    );
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 my-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Products</h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
          {/* 🔎 Search input */}
          <input
            type="text"
            placeholder="Search by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 text-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {/* <button
            onClick={createProductHandler}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 shadow-sm hover:shadow-md w-full sm:w-auto"
            disabled={loadingCreate}
          >
            <FaPlus className="text-sm" /> 
            <span>Create Product</span>
          </button> */}
        </div>
      </div>

      {/* Loading states */}
      {loadingCreate && <Loader />}
      {loadingDelete && <Loader />}

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error?.data?.message || error.error}</Message>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <div className="overflow-hidden rounded-lg shadow-sm border border-gray-200">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Image</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Name</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Category</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Price</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Stock</th>
                    <th className="py-4 px-6 text-center text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-4 px-6">
                        <img
                          src={product.image || '/images/default-product.png'}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm"
                        />
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-900 max-w-xs truncate text-left ">{product.name}</td>
                      <td className="py-4 px-6 text-gray-600 text-left ">{product.category}</td>
                      <td className="py-4 px-6 font-semibold text-gray-900 text-left ">₦{product.price}</td>
                      <td className="py-4 px-6 text-left ">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium  ${
                          product.countInStock > 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.countInStock > 0 ? `${product.countInStock} in stock` : 'Out of stock'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center space-x-2">
                          <Link
                            to={`/admin/product/${product._id}/edit`}
                            className="inline-flex items-center justify-center w-9 h-9 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
                          >
                            <FaEdit className="text-sm" />
                          </Link>
                          <button
                            onClick={() => deleteHandler(product._id)}
                            className="inline-flex items-center justify-center w-9 h-9 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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

          {/* Tablet View - Hidden on mobile and desktop */}
          <div className="hidden md:block lg:hidden">
            <div className="grid gap-4">
              {data.products.map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start space-x-4">
                    <img
                      src={product.image || '/images/default-product.png'}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200 shadow-sm flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-medium text-gray-900 truncate pr-4">{product.name}</h3>
                        <div className="flex space-x-2 flex-shrink-0">
                          <Link
                            to={`/admin/product/${product._id}/edit`}
                            className="inline-flex items-center justify-center w-9 h-9 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
                          >
                            <FaEdit className="text-sm" />
                          </Link>
                          <button
                            onClick={() => deleteHandler(product._id)}
                            className="inline-flex items-center justify-center w-9 h-9 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Category:</span>
                          <p className="text-gray-900 font-medium">{product.category}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Price:</span>
                          <p className="text-gray-900 font-semibold">₦{product.price}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Stock:</span>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.countInStock > 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.countInStock > 0 ? `${product.countInStock} in stock` : 'Out of stock'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Card View - Visible only on mobile */}
          <div className="md:hidden">
            <div className="grid gap-4">
              {data.products.map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-start space-x-3">
                    <img
                      src={product.image || '/images/default-product.png'}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-semibold text-gray-900">₦{product.price}</p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            product.countInStock > 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.countInStock > 0 ? `${product.countInStock}` : 'Out'}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Link
                            to={`/admin/product/${product._id}/edit`}
                            className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
                          >
                            <FaEdit className="text-xs" />
                          </Link>
                          <button
                            onClick={() => deleteHandler(product._id)}
                            className="inline-flex items-center justify-center w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-8 flex justify-start">
            <Paginate pages={data.pages} page={data.page} isAdmin={true} />
          </div>
        </>
      )}
    </div>
  );
};

export default ProductListScreen;