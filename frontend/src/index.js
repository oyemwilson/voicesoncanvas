import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/styles/bootstrap.custom.css';
import './assets/styles/index.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { CurrencyProvider } from './components/CurrencyContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import CartScreen from './screens/CartScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ShippingScreen from './screens/ShippingScreen';
import PaymentScreen from './screens/PaymentScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderScreen from './screens/OrderScreen';
import ProfileScreen from './screens/ProfileScreen';
import OrderListScreen from './screens/admin/OrderListScreen';
import ProductListScreen from './screens/admin/ProductListScreen';
import ProductEditScreen from './screens/admin/ProductEditScreen';
import UserListScreen from './screens/admin/UserListScreen';
import UserEditScreen from './screens/admin/UserEditScreen';
import store from './store';
import { Provider } from 'react-redux';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import WishlistScreen from './screens/Wishlist';
import NotFoundScreen from './screens/Notfound';
import VerifyEmailScreen from './screens/VerifyOtp';
import ForgotPasswordScreen from './screens/ForgottenPassword';
import VerifyResetOTPScreen from './screens/VerifyResetPasswordOTP';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import AdminFeaturedProducts from './screens/admin/AdminFeaturedProducts';
import AdminFeaturedArtists from './screens/admin/AdminFeaturedArtists';
import RequestSellerScreen from './screens/RequestSellerScreen';
import SellerRequestsScreen from './screens/admin/SellerRequestsScreen';
import UploadArtScreen from './screens/UploadArtScreen';
import ArtistProfileScreen from './screens/ArtistProfileScreen';
import UnapprovedArtScreen from './screens/admin/UnapprovedArtScreen';
import ShopPage from './screens/ShopPage';
import ArtistPage from './screens/ArtistScreen';
import ImpactScreen from './screens/ImpactScreen';
import AboutScreen from './screens/AboutScreen';
import ContactScreen from './screens/ContactScreen';
import BlogListScreen from './screens/BlogListScreen';
import BlogDetailScreen from './screens/BlogDetailScreen';
import AdminBlogScreen from './screens/admin/AdminBlogScreen'
import ShipOrderScreen from './screens/ShipOrderscreen';
import SellerOrdersScreen from './screens/SellerOrdersScreen';
import AdminDisputesScreen from './screens/admin/AdminDisputesScreen';


const router = createBrowserRouter(
  createRoutesFromElements(
    
    <Route path="/" element={<App />} errorElement={<NotFoundScreen />}>
      
      {/* Home and product listing */}
      <Route index={true} path="/" element={<HomeScreen />} />
      <Route path="/search/:keyword" element={<HomeScreen />} />
      <Route path="/page/:pageNumber" element={<HomeScreen />} />
      <Route path="/search/:keyword/page/:pageNumber" element={<HomeScreen />} />
      <Route path="/artists" element={<ArtistPage />} />
      <Route path="/shop" element={<ShopPage />} />
      {/* Product details and cart */}
      <Route path="/product/:id" element={<ProductScreen />} />
      <Route path="/cart" element={<CartScreen />} />
      <Route path="/artists/:id" element={<ArtistProfileScreen />} />
      <Route path="/impact" element={<ImpactScreen />} />
      <Route path="/about" element={<AboutScreen />} />
      <Route path="/contact" element={<ContactScreen />} />
      <Route path="/blogs" element={<BlogListScreen />} />
      <Route path="/blog/:id" element={<BlogDetailScreen />} />

      {/* Auth routes */}
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/register" element={<RegisterScreen />} />
      <Route path="/verify-email" element={<VerifyEmailScreen />} />
      <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
      <Route path="/verify-reset-otp" element={<VerifyResetOTPScreen />} />
      <Route path="/reset-password" element={<ResetPasswordScreen />} />



      {/* Private (logged in) routes */}
      <Route path="" element={<PrivateRoute />}>
        <Route path="/shipping" element={<ShippingScreen />} />
        <Route path="/payment" element={<PaymentScreen />} />
        <Route path="/placeorder" element={<PlaceOrderScreen />} />
        <Route path="/order/:id" element={<OrderScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/wishlist" element={<WishlistScreen />} />
        <Route path="/request-seller" element={<RequestSellerScreen />} />
        <Route path="/upload-art" element={<UploadArtScreen />} />
          <Route path="/ship/order/:id" element={<ShipOrderScreen />} />
            <Route path="/seller/orders" element={<SellerOrdersScreen />} />

      </Route>

      {/* Admin-only routes */}
      <Route path="" element={<AdminRoute />}>
        <Route path="/admin/orderlist" element={<OrderListScreen />} />
        <Route path="/admin/productlist" element={<ProductListScreen />} />
        <Route path="/admin/productlist/:pageNumber" element={<ProductListScreen />} />
        <Route path="/admin/product/:id/edit" element={<ProductEditScreen />} />
        <Route path="/admin/userlist" element={<UserListScreen />} />
        <Route path="/admin/user/:id/edit" element={<UserEditScreen />} />
        <Route path="/admin/featured-products" element={<AdminFeaturedProducts />} />
        <Route path="/admin/featured-artists" element={<AdminFeaturedArtists />} />
        <Route path="/admin/seller-requests" element={<SellerRequestsScreen />} />
        <Route path="/admin/unapproved-art" element={<UnapprovedArtScreen />} />
        <Route path="/admin/blogs" element={<AdminBlogScreen />} />
        <Route path='/admin/disputes' element={<AdminDisputesScreen />} />


      </Route>
    </Route>
  )
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <PayPalScriptProvider deferLoading={true}>
          <CurrencyProvider>
            <RouterProvider router={router} />
          </CurrencyProvider>
        </PayPalScriptProvider>
      </Provider>
    </HelmetProvider>
  </React.StrictMode>
);

reportWebVitals();
