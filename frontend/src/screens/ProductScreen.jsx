import { useState, useRef, useContext } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
  useGetProductsByArtistQuery,
} from '../slices/productsApiSlice';
import Rating from '../components/Rating';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Meta from '../components/Meta';
import { addToCart } from '../slices/cartSlice';
import Product from '../components/Product';
import { CurrencyContext } from '../components/CurrencyContext'; // ✅ added

const ProductScreen = () => {
  const { id: productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  // 🖼️ state for main image and zoom modal
  const [mainImage, setMainImage] = useState('');
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const { data: product, isLoading, refetch, error } = useGetProductDetailsQuery(productId);

  const { userInfo } = useSelector((state) => state.auth);
  const [createReview, { isLoading: loadingProductReview }] = useCreateReviewMutation();

  const addToCartHandler = () => {
    dispatch(addToCart({ ...product, qty }));
    navigate('/cart');
  };

  const artistId = product?.user?._id;
  const { data: artistProducts = [], isLoading: loadingArtistProducts } =
    useGetProductsByArtistQuery(artistId, { skip: !artistId });

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await createReview({ productId, rating, comment }).unwrap();
      refetch();
      toast.success('Review created successfully');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const scrollRef = useRef();
  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // ✅ Build a unique list of images
  const allImages = product ? [product.image, ...(product.images || [])] : [];
  const uniqueImages = allImages.filter((img, idx) => img && allImages.indexOf(img) === idx);

  // ✅ Currency logic
  const { currency, rates } = useContext(CurrencyContext);
  const symbols = {
    NGN: '₦',
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
  };
  const convertedPrice = product ? (product.price * (rates[currency] || 1)).toFixed(2) : 0;
  const convertedSalePrice = product?.salePrice
    ? (product.salePrice * (rates[currency] || 1)).toFixed(2)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <Link
          className="inline-block bg-gray-200 text-gray-800 hover:bg-gray-300 px-4 py-2 rounded-md my-3 transition-colors duration-200"
          to="/"
        >
          ← Go Back
        </Link>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader />
          </div>
        ) : error ? (
          <Message variant="danger">{error?.data?.message || error.error}</Message>
        ) : (
          <>
            <Meta title={product.name} description={product.description} />
            
            {/* Main Product Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              
              {/* =================== IMAGE SECTION =================== */}
              <div className="lg:col-span-6 xl:col-span-7">
                <div
                  className="cursor-zoom-in relative group mb-4"
                  onClick={() => setIsZoomOpen(true)}
                >
                  <img
                    src={mainImage || product.image}
                    alt={product.name}
                    className="w-full h-auto max-h-[500px] sm:max-h-[600px] object-cover rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Click to Zoom
                  </div>
                </div>

                {uniqueImages.length > 1 && (
                  <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2">
                    {uniqueImages.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        onClick={() => setMainImage(img)}
                        className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 object-cover rounded border-2 cursor-pointer hover:border-blue-400 transition-colors duration-200 ${
                          (mainImage || product.image) === img
                            ? 'border-blue-500'
                            : 'border-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {isZoomOpen && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4"
                    onClick={() => setIsZoomOpen(false)}
                  >
                    <div
                      className="relative max-w-full max-h-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setIsZoomOpen(false)}
                        className="absolute -top-10 right-0 text-white text-2xl font-bold hover:text-gray-300 transition-colors duration-200"
                      >
                        ✕
                      </button>
                      <img
                        src={mainImage || product.image}
                        alt={product.name}
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* =================== PRODUCT DETAILS =================== */}
              <div className="lg:col-span-6 xl:col-span-5">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden sticky top-4">
                  
                  <div className="p-4 sm:p-6 space-y-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        {product.name}
                      </h1>
                      
                      {product.user && (
                        <div className="text-sm text-gray-600 mb-3">
                          <span>By </span>
                          <span className="font-medium text-gray-800">{product.user.name}</span>
                          {product.user.artistProfile?.location && (
                            <>
                              <span className="mx-2">•</span>
                              <span>{product.user.artistProfile.location}</span>
                            </>
                          )}
                        </div>
                      )}

                      {/* <div className="mb-4">
                        <Rating value={product.rating} text={`${product.numReviews} reviews`} />
                      </div> */}
                    </div>

                    {/* Price Section with conversion */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-medium text-gray-700">Price</span>
                        <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                          {symbols[currency]} {convertedPrice}
                        </span>
                      </div>
                      
                      {product.isOnSale && convertedSalePrice && (
                        <div className="text-sm text-green-600 mb-2">
                          <span className="bg-green-100 px-2 py-1 rounded">On Sale!</span>
                          <span className="ml-2">
                            Original: <span className="line-through">{symbols[currency]} {convertedSalePrice}</span>
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-4">
                        <span className="font-medium text-gray-700">Status</span>
                        <span
                          className={`px-2 py-1 rounded text-sm font-medium ${
                            product.countInStock > 0
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {product.countInStock > 0 ? 'In Stock' : 'Out Of Stock'}
                        </span>
                      </div>
                    </div>

                    <button
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      type="button"
                      disabled={product.countInStock === 0}
                      onClick={addToCartHandler}
                    >
                      {product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Description & Specs */}
            <div className="mt-8 bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Description */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                  {product.tags?.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Specifications */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Product Details</h3>
                  {product.specifications?.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Specifications</h4>
                      <div className="space-y-2">
                        {product.specifications.map((spec, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="font-medium text-gray-600">{spec.key}:</span>
                            <span className="text-gray-800">{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 text-sm">
                    {product.dimensions && (
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Dimensions:</span>
                        <span className="text-gray-800">
                          {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height}
                        </span>
                      </div>
                    )}

                    {product.weight && (
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Weight:</span>
                        <span className="text-gray-800">{product.weight} kg</span>
                      </div>
                    )}

                    {product.sku && (
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">SKU:</span>
                        <span className="text-gray-800">{product.sku}</span>
                      </div>
                    )}
                    {product.type && (
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Type:</span>
                        <span className="text-gray-800">{product.type}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* More works */}
            {artistProducts.length > 1 && (
              <div className="mt-12 bg-white rounded-lg shadow-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
                    More works from {product.user.name}
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => scroll('left')}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors duration-200 font-medium"
                    >
                      ‹ Prev
                    </button>
                    <button
                      onClick={() => scroll('right')}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors duration-200 font-medium"
                    >
                      Next ›
                    </button>
                  </div>
                </div>

                {loadingArtistProducts ? (
                  <div className="flex justify-center py-8">
                    <Loader />
                  </div>
                ) : (
                  <div
                    ref={scrollRef}
                    className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide"
                    style={{ scrollBehavior: 'smooth' }}
                  >
                    {artistProducts
                      .filter((p) => p._id !== product._id)
                      
                      .map((art) => (
                        <div key={art._id} className="flex-shrink-0 w-64">
                          <Product product={art} />
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductScreen;
