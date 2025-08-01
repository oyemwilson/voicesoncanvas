// src/routes/orderRoutes.js
import express from 'express'
import {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToShipped,
  confirmOrderReceived,
  createDispute,
  updateDispute,
  getDisputes,
  getOrders,
  getOrderStats,
  getRecentOrders,
  getSellerOrders,
  getSellerNewSales,
  getSellerOpenSales,
  confirmOrderDelivered,
  updateOrderStatus,
  cancelOrder,
} from '../controllers/orderController.js'
import { protect, admin } from '../middleware/authMiddleware.js'
import checkObjectId from '../middleware/checkObjectId.js'

const router = express.Router()

// 1️⃣ Create & list (admin)
router
  .route('/')
  .post(protect, addOrderItems)
  .get(protect, admin, getOrders)

// 2️⃣ Buyer’s own orders
router.get('/myorders', protect, getMyOrders)

// 3️⃣ Seller dashboards (static)
router.get('/seller', protect, getSellerOrders)
router.get('/my-new-sales', protect, getSellerNewSales)
router.get('/my-open-sales', protect, getSellerOpenSales)

// 4️⃣ Admin dashboards (static)
router.get('/disputes', protect, admin, getDisputes)
router.get('/stats', protect, admin, getOrderStats)
router.get('/recent', protect, admin, getRecentOrders)

// 5️⃣ Per-order actions that don’t clash with `/:id`
//    (deliver by buyer, shipped by seller)
router.put('/:id/deliver', protect, confirmOrderDelivered)
router.put('/:id/ship', protect, checkObjectId, updateOrderToShipped)
router.put('/:id/received', protect, checkObjectId, confirmOrderReceived)

// 6️⃣ Payment, cancellation, status updates, disputes
router.put('/:id/pay', protect, checkObjectId, updateOrderToPaid)
router.put('/:id/cancel', protect, checkObjectId, cancelOrder)

// Dispute endpoints
router.post('/:id/dispute', protect, checkObjectId, createDispute)
router.put('/:id/dispute', protect, admin, checkObjectId, updateDispute)

// Admin-only status change
router.put('/:id/status', protect, admin, checkObjectId, updateOrderStatus)

// 7️⃣ Finally: catch-all to fetch a single order by its ID
router.get('/:id', protect, checkObjectId, getOrderById)

export default router
