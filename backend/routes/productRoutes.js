import express from 'express';
const router = express.Router();

import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
  getProductsByCategory,
  getProductsByBrand,
  getCategories,
  getBrands,
  getFeaturedProducts,
  getSaleProducts,
  getNewArrivals,
  getBestSellers,
  getRecommendedProducts,
  getProductStats,
  toggleFeaturedProduct,
  searchProducts,
  toggleFeaturedCollection,
  getFeaturedCollections,
  approveProduct,
  getProductsByArtist,
  getUnapprovedProducts,
  declineProduct
} from '../controllers/productController.js';

import { protect, admin, approvedSeller } from '../middleware/authMiddleware.js';
import checkObjectId from '../middleware/checkObjectId.js';

// Main product listing & create
router.route('/').get(getProducts).post(protect, approvedSeller, createProduct);

// Top products
router.get('/top', getTopProducts);

// Featured products
router.get('/featured', getFeaturedProducts);

// Sale products
router.get('/sale', getSaleProducts);

// New arrivals
router.get('/new-arrivals', getNewArrivals);

// Best sellers
router.get('/best-sellers', getBestSellers);

// Get categories and brands
router.get('/categories', getCategories);
router.get('/brands', getBrands);

// Get products by category
router.get('/category/:category', getProductsByCategory);

// Get products by brand
router.get('/brand/:brand', getProductsByBrand);

// Get recommended products
router.get('/recommended/:id', checkObjectId, getRecommendedProducts);

// Get product statistics (admin only)
router.get('/stats', protect, admin, getProductStats);

// Create product review
router.route('/:id/reviews').post(protect, checkObjectId, createProductReview);

// Toggle featured status (admin only)
router.put('/:id/featured', protect, admin, checkObjectId, toggleFeaturedProduct);

router.get('/search', searchProducts);

router.put('/:id/approve', protect, admin, approveProduct);

router
  .route('/:id')
  .delete(protect, admin, declineProduct)
//rrrr
router.get('/featured-collections', getFeaturedCollections);
router.put('/:id/feature-collection', protect, admin, toggleFeaturedCollection);
router.get('/artist/:artistId', getProductsByArtist);

router.get('/unapproved', protect, admin, getUnapprovedProducts);




// Get, update, delete single product
router
  .route('/:id')
  .get(checkObjectId, getProductById)
  .put(protect, approvedSeller, checkObjectId, updateProduct) // ✅ allow sellers
  .delete(protect, admin, checkObjectId, deleteProduct);

export default router;
