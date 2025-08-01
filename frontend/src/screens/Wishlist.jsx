import { Link } from 'react-router-dom';
import { useGetWishlistQuery, useRemoveFromWishlistMutation } from '../slices/wishListApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';

const WishlistScreen = () => {
  const { data: wishlist, isLoading, error, refetch } = useGetWishlistQuery();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  const removeHandler = async (id) => {
    await removeFromWishlist(id);
    refetch();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">❤️ My Wishlist</h1>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error?.data?.message || error.error}</Message>
      ) : wishlist.length === 0 ? (
        <Message>You have no items in your wishlist. <Link to="/">Go Shopping</Link></Message>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <div key={product._id} className="bg-white rounded-xl shadow-md p-4 relative">
              <Link to={`/product/${product._id}`}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-md mb-3"
                />
                <h2 className="text-lg font-semibold">{product.name}</h2>
                <p className="text-gray-600 mt-1">${product.price}</p>
              </Link>
              <button
                onClick={() => removeHandler(product._id)}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded-full"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistScreen;
