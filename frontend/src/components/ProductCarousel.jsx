import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Message from './Message';
import { useGetTopProductsQuery } from '../slices/productsApiSlice';

const ProductCarousel = () => {
  const { data: products, isLoading, error } = useGetTopProductsQuery();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (products && products.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [products]);

  if (isLoading) return null;
  if (error) {
    return <Message variant="danger">{error?.data?.message || error.error}</Message>;
  }

  return (
    <div className="relative bg-gray-800 mb-4 rounded-xl overflow-hidden">
      <div className="overflow-hidden relative h-64 md:h-80 lg:h-[400px]">
        <div
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {products.map((product) => (
            <div className="w-full flex-shrink-0 relative h-full" key={product._id}>
              <Link to={`/product/${product._id}`} className="block h-full">
                {/* Image */}
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                {/* Caption */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h2 className="text-lg md:text-xl font-bold">
                    {product.name}
                  </h2>
                  <p className="text-sm md:text-base font-medium">
                    ₦{product.price.toLocaleString()}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductCarousel;
