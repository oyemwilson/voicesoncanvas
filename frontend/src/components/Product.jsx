import { useAddToWishlistMutation, useRemoveFromWishlistMutation, useGetWishlistQuery } from '../slices/wishListApiSlice';
import { useDispatch, useSelector } from 'react-redux';
import { FaHeart, FaRegHeart, FaShoppingCart, FaEye, FaPlus } from 'react-icons/fa';
import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { addToCart } from '../slices/cartSlice';
import { toast } from 'react-toastify';
import { CurrencyContext } from './CurrencyContext';

const Product = ({ product }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // ✅ currency context
  const { currency, rates } = useContext(CurrencyContext);

  const symbols = {
    NGN: '₦',
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
  };

  const convertedPrice = (product.price * (rates[currency] || 1)).toFixed(2);

  const { data: wishlist } = useGetWishlistQuery(undefined, {
    skip: !userInfo,
  });

  const [addToWishlist, { isLoading: addingToWishlist }] = useAddToWishlistMutation();
  const [removeFromWishlist, { isLoading: removingFromWishlist }] = useRemoveFromWishlistMutation();

  const [isWished, setIsWished] = useState(false);
  const [imageError, setImageError] = useState(false);

  const wishlistOperationInProgress = addingToWishlist || removingFromWishlist;

  useEffect(() => {
    if (wishlist && Array.isArray(wishlist)) {
      const found = wishlist.find((item) => item._id === product._id);
      setIsWished(!!found);
    }
  }, [wishlist, product._id]);

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userInfo) {
      toast.error('Please login to manage your wishlist.');
      return;
    }

    if (wishlistOperationInProgress) return;

    const previousState = isWished;
    setIsWished(!isWished);

    try {
      if (isWished) {
        await removeFromWishlist(product._id).unwrap();
        toast.info(`${product.name} removed from wishlist`);
      } else {
        await addToWishlist(product._id).unwrap();
        toast.success(`${product.name} added to wishlist`);
      }
    } catch (err) {
      console.error('Wishlist error:', err);
      setIsWished(previousState);
      toast.error(err?.data?.message || 'Something went wrong updating wishlist.');
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.countInStock === 0) return;

    dispatch(addToCart({ ...product, qty: 1 }));
    toast.success(`${product.name} added to cart!`);
  };

  const handleImageError = () => setImageError(true);

  const isOutOfStock = product.countInStock === 0;
  const stockDisplay = isOutOfStock
    ? 'Sold out'
    : product.countInStock <= 5
    ? `Only ${product.countInStock} left`
    : `${product.countInStock} available`;

  return (
    <div className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col">
      {/* Wishlist Button */}
      <button
        onClick={handleWishlist}
        disabled={wishlistOperationInProgress || !userInfo}
        className={`absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/90 backdrop-blur-sm rounded-full p-1.5 sm:p-2 shadow-md hover:shadow-lg hover:scale-110 transition-all duration-200 z-10 ${
          wishlistOperationInProgress ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {wishlistOperationInProgress ? (
          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
        ) : isWished ? (
          <FaHeart className="text-red-500 w-4 h-4 sm:w-5 sm:h-5" />
        ) : (
          <FaRegHeart className="text-gray-500 w-4 h-4 sm:w-5 sm:h-5 hover:text-red-400 transition-colors" />
        )}
      </button>

      {/* Out of Stock Badge */}
      {isOutOfStock && (
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-md z-10">
          Sold Out
        </div>
      )}

      {/* Product Image */}
      <Link to={`/product/${product._id}`} className="block">
        <div className="relative w-full h-40 sm:h-48 md:h-56 lg:h-64 bg-gray-50 overflow-hidden">
          {imageError ? (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="text-2xl sm:text-4xl mb-2">🖼️</div>
                <p className="text-xs sm:text-sm">Image not available</p>
              </div>
            </div>
          ) : (
            <img
              src={product.image}
              alt={product.name}
              onError={handleImageError}
              className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                isOutOfStock ? 'opacity-60' : ''
              }`}
              loading="lazy"
            />
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-2 sm:p-3 md:p-4 flex flex-col flex-grow space-y-1 sm:space-y-2">
        <Link to={`/product/${product._id}`} className="block">
          <h2 className="text-gray-800 font-semibold text-sm sm:text-base md:text-lg leading-tight hover:text-blue-600 transition-colors line-clamp-2">
            {product.name}
          </h2>
        </Link>

        <div className="text-xs sm:text-sm text-gray-500 line-clamp-1">
          {product.user ? (
            <>
              By <span className="font-medium text-gray-700">{product.user.name}</span>
              {product.user.artistProfile?.location && (
                <> • <span className="text-gray-500">{product.user.artistProfile.location}</span></>
              )}
            </>
          ) : (
            <>By {product.brand}</>
          )}
        </div>

        <p className="hidden sm:block text-xs sm:text-sm text-gray-500 line-clamp-1">
          {product.medium} • {product.type}
        </p>

        {/* ✅ Price with selected currency */}
        <p className="text-gray-900 font-bold text-base sm:text-lg md:text-xl">
          {symbols[currency]} {convertedPrice}
        </p>

        {/* <p
          className={`text-xs font-medium ${
            isOutOfStock
              ? 'text-red-500'
              : product.countInStock <= 5
              ? 'text-orange-500'
              : 'text-green-600'
          }`}
        >
          {stockDisplay}
        </p> */}

        {/* Buttons */}
        <div className="mt-auto pt-2">
          <div className="flex sm:hidden gap-2 justify-between">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-md border text-xs font-medium transition-all duration-200 ${
                isOutOfStock
                  ? 'border-gray-300 text-gray-400 cursor-not-allowed opacity-50'
                  : 'border-black text-black hover:bg-black hover:text-white hover:shadow-md active:scale-95'
              }`}
            >
              {isOutOfStock ? (
                <span className="text-xs">Sold Out</span>
              ) : (
                <>
                  <FaPlus className="w-3 h-3" />
                  <span className="text-xs">Cart</span>
                </>
              )}
            </button>

            <Link
              to={`/product/${product._id}`}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-md border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 active:scale-95"
            >
              <FaEye className="w-3 h-3" />
              <span className="text-xs">View</span>
            </Link>
          </div>

          <div className="hidden sm:flex flex-col md:flex-row gap-2 md:gap-3">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 px-3 md:px-4 py-2 rounded-md border text-xs sm:text-sm font-medium transition-all duration-200 ${
                isOutOfStock
                  ? 'border-gray-300 text-gray-400 cursor-not-allowed opacity-50'
                  : 'border-black text-black hover:bg-gray-100 hover:text-white hover:shadow-md active:scale-95'
              }`}
            >
              {isOutOfStock ? 'Sold Out' : 'Add To Cart'}
            </button>

            <Link
              to={`/product/${product._id}`}
              className="flex-1 px-3 md:px-4 py-2 rounded-md border border-gray-300 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 text-center active:scale-95"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
