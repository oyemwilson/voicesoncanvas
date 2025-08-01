import React, { useRef } from 'react';
import { useParams, Link, Link as RouterLink } from 'react-router-dom';
import {
  useGetProductsQuery,
  useGetFeaturedProductsQuery,
  useGetSaleProductsQuery,
  useGetBestSellersQuery,
  useGetNewArrivalsQuery,
} from '../slices/productsApiSlice';
import { useGetFeaturedArtistsQuery } from '../slices/usersApiSlice';
import Product from '../components/Product';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Paginate from '../components/Paginate';
import ProductCarousel from '../components/ProductCarousel';
import Meta from '../components/Meta';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import PhotoCarousel from '../components/StudioCarousel';

const HomeScreen = () => {
  const { pageNumber, keyword } = useParams();
  const artistsScrollRef = useRef(null);

  // products
  const { data, isLoading, error } = useGetProductsQuery({ keyword, pageNumber });
  const { data: featuredData } = useGetFeaturedProductsQuery();
  const { data: saleData } = useGetSaleProductsQuery();
  const { data: bestSellersData } = useGetBestSellersQuery();
  const { data: newArrivalsData } = useGetNewArrivalsQuery();

  // featured artists
  const { data: featuredArtists, isLoading: loadingArtists, error: artistsError } =
    useGetFeaturedArtistsQuery();

  const scrollArtists = (direction) => {
    if (artistsScrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      artistsScrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="px-3 sm:px-4 md:px-8 lg:px-16 pb-6 sm:pb-8">
      {!keyword ? (
        <div className="mb-6 sm:mb-8">
          {/* <ProductCarousel /> */}
          <PhotoCarousel />
        </div>
      ) : (
        <Link
          to="/"
          className="inline-block mb-6 bg-gray-100 text-gray-800 hover:bg-gray-200 px-4 py-2 rounded-md transition"
        >
          ← Back to Home
        </Link>
      )}

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error?.data?.message || error.error}</Message>
      ) : (
        <>
          <Meta />

          {/* Featured Artists section with horizontal scroll */}
          {loadingArtists ? (
            <Loader />
          ) : artistsError ? null : featuredArtists?.length > 0 ? (
            <div className="mb-10 sm:mb-14 relative">
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Featured Artists</h2>
                <div className="w-12 sm:w-16 h-0.5 bg-gray-800 mx-auto mt-2"></div>
              </div>

              <div className="relative group">
                {/* Navigation buttons */}
                <button 
                  onClick={() => scrollArtists('left')}
                  className="hidden sm:block absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition opacity-0 group-hover:opacity-100"
                  aria-label="Scroll left"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                
                <button 
                  onClick={() => scrollArtists('right')}
                  className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition opacity-0 group-hover:opacity-100"
                  aria-label="Scroll right"
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>

                {/* Scrollable container for mobile, centered grid for desktop */}
                <div 
                  ref={artistsScrollRef}
                  className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory space-x-4 md:space-x-6 pb-4 md:overflow-x-visible md:flex-wrap md:justify-center"
                >
                  {featuredArtists.map((artist) => (
                    <RouterLink
                      key={artist._id}
                      to={`/artists/${artist._id}`}
                      className="flex-shrink-0 snap-start w-[160px] sm:w-[180px] hover:scale-105 transition-transform duration-200 md:mx-2 md:my-2"
                    >
                      <div className="p-4 bg-white rounded-lg shadow-sm text-center hover:shadow-md transition-shadow duration-200 h-full">
                        <img
                          src={
                            artist.artistProfile?.photo
                              ? artist.artistProfile.photo
                              : '/images/default-avatar.png'
                          }
                          alt={artist.name}
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-full mx-auto mb-3"
                        />
                        <h3 className="text-base sm:text-lg font-medium text-gray-800 line-clamp-1">
                          {artist.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                          {artist.artistProfile?.location || 'Location not set'}
                        </p>
                      </div>
                    </RouterLink>
                  ))}
                </div>
              </div>
              
              {/* View All Artists button */}
              <div className="text-center mt-4">
                <RouterLink
                  to="/artists"
                  className="inline-block px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors duration-200"
                >
                  View All Artists
                </RouterLink>
              </div>
            </div>
          ) : null}

          {/* Featured Products section */}
          {featuredData?.length > 0 && (
            <ProductSection title="Featured Products" viewAllLink="/shop">
              {featuredData.map((product) => (
                <Product key={product._id} product={product} />
              ))}
            </ProductSection>
          )}

          {/* New Arrivals */}
          {newArrivalsData?.length > 0 && (
            <ProductSection title="New Arrivals" viewAllLink="/shop?sort=newest">
              {newArrivalsData.map((product) => (
                <Product key={product._id} product={product} />
              ))}
            </ProductSection>
          )}
        </>
      )}
    </div>
  );
};

// ProductSection component remains the same
const ProductSection = ({ title, children, viewAllLink = "/shop" }) => {
  const count = React.Children.count(children);

  const layoutClass =
    count <= 2
      ? 'flex justify-center gap-4 sm:gap-6 flex-wrap'
      : count <= 3
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 place-items-center sm:place-items-stretch'
      : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6';

  return (
    <section className="mb-10 sm:mb-14">
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">{title}</h2>
        <div className="w-12 sm:w-16 h-0.5 bg-gray-800 mx-auto mt-2"></div>
      </div>
      <div className={layoutClass}>{children}</div>
      
      {/* View All button */}
      <div className="text-center mt-6">
        <RouterLink
          to={viewAllLink}
          className="inline-block px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors duration-200"
        >
          View All
        </RouterLink>
      </div>
    </section>
  );
};

export default HomeScreen;