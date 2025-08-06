
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { logout } from '../slices/authSlice';
import { resetCart } from '../slices/cartSlice';
import { useState, useEffect, useRef, useContext } from 'react';
import SearchBox from './SearchBox';
import { FaShoppingCart, FaUser, FaHeart, FaBars, FaCrown } from 'react-icons/fa';
import { CurrencyContext } from './CurrencyContext';

// ✅ import hooks to fetch notifications
import { useGetUnapprovedProductsQuery } from '../slices/productsApiSlice';
import { useGetSellerRequestsQuery } from '../slices/usersApiSlice'; // make sure you’ve implemented this!
import { useGetDisputesQuery, useGetSellerOpenSalesQuery } from '../slices/ordersApiSlice';


const Header = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall] = useLogoutMutation();
  const { currency, setCurrency } = useContext(CurrencyContext);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);

  const userDropdownRef = useRef();
  const adminDropdownRef = useRef();

  // ✅ Fetch counts
  const { data: unapprovedProducts = [] } = useGetUnapprovedProductsQuery(undefined, {
    skip: !userInfo?.isAdmin,
  });
  const { data: sellerRequests = [] } = useGetSellerRequestsQuery(undefined, {
    skip: !userInfo?.isAdmin,
  });
 const { data: disputes = [] } = useGetDisputesQuery(undefined, {
  skip: !userInfo?.isAdmin,
});
const { data: newSales = [] } = useGetSellerOpenSalesQuery(undefined, {
  skip: !(userInfo?.isSeller && userInfo?.sellerApproved),
});

  

  const unapprovedCount = unapprovedProducts.length;
  const sellerRequestCount = sellerRequests.length;
 const disputeCount = Array.isArray(disputes)
    ? disputes.filter((d) => d.dispute?.status === 'open').length
    : 0;
const newSalesCount       = newSales.length;

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      dispatch(resetCart());
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(e.target)) {
        setAdminDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderSellerMenuItem = () => {
    if (!userInfo) return null;
    if (!userInfo.isSeller) {
      return (
        <Link
          to="/request-seller"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Request to Sell
        </Link>
      );
    }
    if (userInfo.isSeller && !userInfo.sellerApproved) {
      return (
        <span className="block px-4 py-2 text-sm text-gray-500 cursor-not-allowed">
          Pending Approval
        </span>
      );
    }
    if (userInfo.isSeller && userInfo.sellerApproved) {
      return (
        <Link
          to={`/artists/${userInfo._id}`}
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          View Artist Profile
        </Link>
      );
    }
    return null;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      {/* TOP PROMO */}
<div className="bg-[#ffefc0] text-yellow-900 text-sm py-0 px-4 flex justify-end items-center">
  {/* Left Aligned Content */}
  {/* <div className="text-center tracking-wide">
    🌟 FREE SHIPPING ON ALL ORDERS ABOVE ₦50 · SHOP WITH CONFIDENCE
  </div> */}

  {/* Right Aligned Content (Currency Selector Bar) */}
  <div className="flex items-center space-x-2  px-4 py-1 rounded-lg"> {/* Added padding and rounded corners for visual separation */}
    <label htmlFor="currency" className="font-medium text-gray-700">Currency:</label>
    <select
      id="currency"
      value={currency}
      onChange={(e) => setCurrency(e.target.value)}
      className="border rounded px-2 py-1 text-sm bg-[#ffefc0]  text-gray-800 focus:outline-none focus:ring-1 focus:ring-yellow-500"
    >
      <option value="NGN">₦ NGN</option>
      <option value="USD">$ USD</option>
      <option value="EUR">€ EUR</option>
      <option value="GBP">£ GBP</option>
      <option value="JPY">¥ JPY</option>
    </select>
  </div>
</div>


      <div className="relative bg-[#ffefc0] overflow-hidden h-10 text-lg flex items-center text-yellow-900 border-t border-b border-black">
        <div className="marquee-wrapper flex whitespace-nowrap">
          <span className="marquee-content">
            BUY MORE · SAVE MORE · GET REWARDED · FREE RETURNS · EXCLUSIVE DEALS ·
          </span>
          <span className="marquee-content">
            BUY MORE · SAVE MORE · GET REWARDED · FREE RETURNS · EXCLUSIVE DEALS ·
          </span>
        </div>
      </div>

      {/* TOP BAR */}
      <div className="bg-[#faf2e7]">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between relative">
          {/* MOBILE LEFT */}
          <div className="flex items-center space-x-3 md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <FaBars className="w-6 h-6" />
            </button>
            <Link to="/wishlist">
              <FaHeart className="w-5 h-5" />
            </Link>
          </div>

          {/* DESKTOP SEARCH */}
          <div className="hidden md:flex items-center space-x-3 ps-10">
            <div className="xl:w-[400px] w-[250px] ">
              <SearchBox />
            </div>
          </div>

          {/* LOGO */}
          {/* LOGO */}
          <Link
            to="/"
            className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center"
          >
            <img
              src="/images/Logo.png" // ✅ path from public folder
              alt="Voices on Canvas"
              className="h-12 md:h-20 w-auto"
            />
          </Link>


          {/* RIGHT ICONS */}
          <div className="flex items-center space-x-6 ml-auto md:pe-32">
            <Link to="/wishlist" className="hidden md:inline-block">
              <FaHeart className="w-5 h-5 text-black" />
            </Link>

            {/* CART */}
            <Link to="/cart" className="relative">
              <FaShoppingCart className="w-5 h-5 text-black" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-bold rounded-md px-1.5 py-0.5">
                  {cartItems.reduce((a, c) => a + c.qty, 0)}
                </span>
              )}
            </Link>

            {/* USER */}
            {userInfo ? (
              <div className="relative" ref={userDropdownRef}>
               <button
   onClick={() => setUserDropdownOpen(!userDropdownOpen)}
   className="relative"
 >
   <FaUser className="w-5 h-5 text-black" />
   {newSalesCount > 0 && (
     <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full" />
   )}
 </button>
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 text-black bg-white rounded-md shadow-lg border z-50">
                    <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-gray-100">
                      Profile
                    </Link>
                    {renderSellerMenuItem()}
{userInfo.isSeller && userInfo.sellerApproved && (
                  <Link
                    to="/seller/orders"
                    className="flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    <span>My Sales</span>
                    {newSalesCount > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                        {newSalesCount}
                      </span>
                    )}
                  </Link>
                )}
                    <button
                      onClick={logoutHandler}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <FaUser className="w-5 h-5" />
              </Link>
            )}

            {/* ADMIN */}
            {userInfo && userInfo.isAdmin && (
              <div className="relative" ref={adminDropdownRef}>
                <button
                  onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                  className="text-yellow-500 hover:text-yellow-600 relative"
                >
                  <FaCrown className="w-5 h-5 text-black" />
                  {(unapprovedCount > 0 || sellerRequestCount > 0) && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full"></span>
                  )}
                </button>
                {adminDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border text-black z-50">
                    <Link to="/admin/productlist" className="block px-4 py-2 text-sm hover:bg-gray-100">
                      Products
                    </Link>
                    <Link to="/admin/orderlist" className="block px-4 py-2 text-sm hover:bg-gray-100">
                      Orders
                    </Link>
                    <Link to="/admin/userlist" className="block px-4 py-2 text-sm hover:bg-gray-100">
                      Users
                    </Link>
                    <Link to="/admin/featured-products" className="block px-4 py-2 text-sm hover:bg-gray-100">
                      Featured Products
                    </Link>
                    <Link to="/admin/featured-artists" className="block px-4 py-2 text-sm hover:bg-gray-100">
                      Featured Artists
                    </Link>

                    <Link
                      to="/admin/unapproved-art"
                      className="flex justify-between items-center px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      Unapproved Art
                      {unapprovedCount > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                          {unapprovedCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/admin/seller-requests"
                      className="flex items-center justify-between px-4 py-2 text-sm text-black  hover:bg-gray-100 rounded-md"
                    >
                      <span>Seller Requests</span>
                      {sellerRequestCount > 0 && (
                        <span className="ml-3 inline-flex min-w-[20px] h-5 items-center  justify-center rounded-full bg-red-600 text-white text-xs font-semibold px-2 py-0.5">
                          {sellerRequestCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/admin/blogs"
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      Manage Blogs
                    </Link>
                    {/* NEW • Disputes */}
                    <Link
                      to="/admin/disputes"
                      className="flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      <span>Disputes</span>
                      {disputeCount > 0 && (
                        <span className="ml-3 inline-flex min-w-[20px] h-5 items-center  justify-center rounded-full bg-red-600 text-white text-xs font-semibold px-2 py-0.5">
                          {disputeCount}
                        </span>
                      )}
                    </Link>

                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* NAV LINKS */}
      <div className="hidden md:flex justify-center border-t border-gray-100 bg-[#faf2e7] ">
        <nav className="flex items-center space-x-8 py-3 text-sm font-medium text-gray-700">
          <Link to="/" className="hover:text-black">Home</Link>
          <Link to="/shop" className="hover:text-black">Shop</Link>
          <Link to="/artists" className="hover:text-black">Artist Profiles</Link>
          <Link to="/impact" className="hover:text-black">Impact</Link>
          <Link to="/about" className="hover:text-black">About Us</Link>
          <Link to="/blogs" className="hover:text-black">Blog</Link>
          <Link to="/contact" className="hover:text-black">Contact</Link>
          {userInfo && userInfo.isSeller && userInfo.sellerApproved && (
            <Link to="/upload-art" className="hover:text-black">Upload Art</Link>
          )}
        </nav>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-[#faf2e7] border-t border-gray-200 px-4 py-3 space-y-2">
          <Link to="/" className="block hover:text-black">Home</Link>
          <Link to="/shop" className="block hover:text-black">Shop</Link>
          <Link to="/artists" className="block hover:text-black">Artist Profiles</Link>
          <Link to="/impact" className="block hover:text-black">Impact</Link>
          <Link to="/about" className="block hover:text-black">About Us</Link>
          <Link to="/blogs" className="block hover:text-black">Blog</Link>
          <Link to="/contact" className="block hover:text-black">Contact</Link>
          {userInfo && userInfo.isSeller && userInfo.sellerApproved && (
            <Link to="/upload-art" className="block hover:text-black">Upload Art</Link>
          )}
        </nav>
      )}

      {/* SEARCH MOBILE */}
      <div className="md:hidden border-t border-gray-100 bg-gray-50 py-3">
        <div className="max-w-3xl mx-auto px-4">
          <SearchBox />
        </div>
      </div>
    </header>
  );
};

export default Header;
