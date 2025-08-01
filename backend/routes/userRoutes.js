import express from 'express';
import {
  authUser,
  registerUser,
  verifyEmail,
  resendOTP,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  changePassword,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  getUserStats,
  logoutUser,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleFeaturedArtist,
  getFeaturedArtists,
  getMyProducts,
  getArtistProfile,
  getSellerRequests,
  requestSeller,
  approveSeller,
  getSellers,
  declineSeller
} from '../controllers/userController.js';
import { protect, admin, approvedSeller } from '../middleware/authMiddleware.js';

const router = express.Router();

// =======================
// Public Auth Routes
// =======================
router.post('/auth', authUser);
router.post('/', registerUser);

// Email verification
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOTP);

// Password reset flows
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);

// Logout
router.post('/logout', logoutUser);

//get my product

router.get('/mine', protect, approvedSeller, getMyProducts);
// =======================
// Protected User Profile
// =======================
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Change password
router.put('/change-password', protect, changePassword);
//rrrr
router.get('/featured-artists', getFeaturedArtists);
router.put('/:id/feature-artist', protect, admin, toggleFeaturedArtist);

// ✅ Approve seller (admin only)
router.put('/:id/approve-seller', protect, admin, approveSeller);

router.delete(
   '/:id/decline-seller',
   protect,
   admin,
   declineSeller
 )
// =======================
// Wishlist (private)
// =======================
router
  .route('/wishlist')
  .get(protect, getWishlist); // get logged-in user's wishlist

router
  .route('/wishlist/:productId')
  .post(protect, addToWishlist)   // add product
  .delete(protect, removeFromWishlist); // remove product

  // ✅ Request Seller
router.put('/request-seller', protect, requestSeller);

// =======================
// Admin Routes
// =======================
router.get('/stats', protect, admin, getUserStats);
router.get('/seller-requests', protect, admin, getSellerRequests);

router.route('/sellers')
  .get(getSellers);

router
  .route('/')
  .get(protect, admin, getUsers); // get all users

router.get('/:id/artist-profile', getArtistProfile);
router
  .route('/:id')
  .delete(protect, admin, deleteUser)
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser);

export default router;
