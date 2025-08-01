import asyncHandler from '../middleware/asyncHandler.js';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import { calcPrices } from '../utils/calcPrices.js';
import { verifyPayPalPayment, checkIfNewTransaction } from '../utils/paypal.js';
import { sendNotificationEmail } from '../utils/sendEmail.js'

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, packagingOption } = req.body

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  } else {
    // NOTE: here we must assume that the prices from our client are incorrect.
    // We must only trust the price of the item as it exists in
    // our DB. This prevents a user paying whatever they want by hacking our client
    // side code - https://gist.github.com/bushblade/725780e6043eaf59415fbaf6ca7376ff

    // get the ordered items from our database
    const itemsFromDB = await Product.find({
      _id: { $in: orderItems.map((x) => x._id) },
    });

    // map over the order items and use the price from our items from database
    const dbOrderItems = orderItems.map((itemFromClient) => {
      const matchingItemFromDB = itemsFromDB.find(
        (itemFromDB) => itemFromDB._id.toString() === itemFromClient._id
      );
      return {
        ...itemFromClient,
         seller: matchingItemFromDB.user || matchingItemFromDB.seller,
        product: itemFromClient._id,
        price: matchingItemFromDB.price,
        _id: undefined,
      };
    });

    // calculate prices
    const { itemsPrice, taxPrice, shippingPrice, totalPrice } =
      calcPrices(dbOrderItems);

    const order = new Order({
      orderItems: dbOrderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      packagingOption: packagingOption || 'Standard',
      orderStatus: 'pending',
      disputeStatus: 'none',
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
   .populate('user', 'name email')
  .populate('orderItems.seller', 'name email');

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to paid
// @route   PUT /api

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const { paymentGateway } = req.body;

  // --- Payment verification for PayPal only ---
  if (paymentGateway === 'paypal') {
    const { verified } = await verifyPayPalPayment(req.body.id);
    if (!verified) throw new Error('Payment not verified');
    const isNewTransaction = await checkIfNewTransaction(Order, req.body.id);
    if (!isNewTransaction) throw new Error('Transaction used before');
  }

  // --- Load order ---
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // --- Mark paid ---
  order.isPaid = true;
  order.paidAt = Date.now();
  order.orderStatus = 'processing';
  order.paymentResult = {
    id: req.body.id || req.body.reference,
    status: req.body.status || 'success',
    email_address: req.body.payer?.email_address || req.body.email,
  };

  // --- Decrement stock ---
  for (const item of order.orderItems) {
    const product = await Product.findById(item.product);
    if (product) {
      product.countInStock = Math.max(product.countInStock - item.qty, 0);
      await product.save();
    }
  }

  // --- Save the paid order ---
  const updatedOrder = await order.save();

  // --- Notify each seller ---
  const sellerIds = [...new Set(order.orderItems.map((item) => item.seller.toString()))];
  for (const sellerId of sellerIds) {
    const sellerUser = await User.findById(sellerId);
    if (sellerUser?.email) {
      try {
        await sendNotificationEmail({
          to: sellerUser.email,
          subject: 'Payment Received – Please Ship Your Item',
          type: 'payment_received',
          orderData: {
            orderId: order._id,
            orderNumber: order._id.toString().slice(-8),
            totalPrice: order.totalPrice,
            shippingAddress: order.shippingAddress,
          },
        });
      } catch (err) {
        console.error(`Failed to send payment notification to seller ${sellerId}:`, err);
      }
    }
  }

  res.json(updatedOrder);
});




// @desc    Update order with shipping details
// @route   PUT /api/orders/:id/ship
// @access  Private (Seller only)
const updateOrderToShipped = asyncHandler(async (req, res) => {
  const { trackingNumber, carrier, shippingDate } = req.body;
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check if user is the seller (order creator) or admin
  if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(401);
    throw new Error('Not authorized to update this order');
  }

  if (!order.isPaid) {
    res.status(400);
    throw new Error('Order must be paid before shipping');
  }

  order.isShipped = true;
  order.shippedAt = shippingDate || Date.now();
  order.orderStatus = 'shipped';
  order.shippingDetails = {
    trackingNumber,
    carrier: carrier || 'Standard Shipping',
    shippedAt: shippingDate || Date.now(),
  };

  const updatedOrder = await order.save();

  // Notify buyer that order has been shipped
  try {
    // You'll need to get buyer info from the order items or add buyer field to order model
    const buyerEmail = order.paymentResult?.email_address;
    if (buyerEmail) {
      await sendNotificationEmail({
        to: buyerEmail,
        subject: 'Your Order Has Been Shipped',
        type: 'order_shipped',
        orderData: {
          orderId: order._id,
          orderNumber: order._id.toString().slice(-8),
          trackingNumber,
          carrier: carrier || 'Standard Shipping',
          shippingAddress: order.shippingAddress,
        }
      });
    }
  } catch (emailError) {
    console.error('Failed to send shipping notification email:', emailError);
  }

  res.json(updatedOrder);
});

// @desc    Confirm order received by buyer
// @route   PUT /api/orders/:id/received
// @access  Private (Buyer only)
const confirmOrderReceived = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check if user is the buyer (you might need to add buyer field to order model)
  // For now, assuming any authenticated user can confirm receipt
  
  if (!order.isShipped) {
    res.status(400);
    throw new Error('Order must be shipped before it can be marked as received');
  }

  order.isDelivered = true;
  order.deliveredAt = Date.now();
  order.orderStatus = 'delivered';
  order.confirmedReceipt = true;
  order.confirmedReceiptAt = Date.now();

  const updatedOrder = await order.save();

  // Notify seller that order has been confirmed as received
  try {
    await sendNotificationEmail({
      to: order.user.email,
      subject: 'Order Confirmed as Delivered',
      type: 'order_delivered',
      orderData: {
        orderId: order._id,
        orderNumber: order._id.toString().slice(-8),
        totalPrice: order.totalPrice,
      }
    });
  } catch (emailError) {
    console.error('Failed to send delivery confirmation email:', emailError);
  }

  res.json(updatedOrder);
});

// @desc    Create dispute
// @route   POST /api/orders/:id/dispute
// @access  Private
const createDispute = asyncHandler(async (req, res) => {
  const { reason, description, disputeType } = req.body;

  // fetch order + buyer + each item's seller
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('orderItems.seller', 'name email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const isBuyer  = order.user._id.equals(req.user._id);
  const isSeller = order.orderItems.some(i => i.seller._id.equals(req.user._id));
  if (!isBuyer && !isSeller && !req.user.isAdmin) {
    res.status(401);
    throw new Error('Not authorized to create dispute for this order');
  }

  if (order.disputeStatus !== 'none') {
    res.status(400);
    throw new Error('Dispute already exists for this order');
  }

  const validReasons = [
    'item_not_received',
    'item_not_as_described',
    'damaged_item',
    'wrong_item',
    'payment_issue',
    'other',
  ];
  if (!validReasons.includes(reason)) {
    res.status(400);
    throw new Error('Invalid dispute reason');
  }

  // flag and embed dispute
  order.disputeStatus = 'open';
  order.dispute = {
    reason,
    description,
    disputeType: disputeType || 'general',
    createdBy: req.user._id,
    createdAt: Date.now(),
    status: 'open',
  };

  const updated = await order.save();

  // 1) notify admin
  try {
    await sendNotificationEmail({
      to: process.env.ADMIN_EMAIL,
      subject: 'New Dispute Created',
      type: 'dispute_created',
      orderData: {
        orderId: order._id,
        orderNumber: order._id.toString().slice(-8),
        reason,
        description,
        createdBy: req.user.name || req.user.email,
      },
    });
  } catch (err) {
    console.error('❌ Admin notification failed:', err);
  }

  // 2) notify counter-party(ies)
  let recipEmails = [];
  if (isBuyer) {
    // every seller on this order
    recipEmails = order.orderItems.map(i => i.seller.email);
  } else if (isSeller) {
    // single buyer
    recipEmails = [order.user.email];
  }
  recipEmails = Array.from(new Set(recipEmails))
    .filter(email => email && email !== req.user.email);

  await Promise.all(
    recipEmails.map(email =>
      sendNotificationEmail({
        to: email,
        subject: 'A Dispute Has Been Opened',
        type: 'dispute_notification',
        orderData: {
          orderId: order._id,
          orderNumber: order._id.toString().slice(-8),
          reason,
        },
      }).catch(err => console.error(`❌ Failed to notify ${email}:`, err))
    )
  );

  res.json(updated);
});


// @desc    Update dispute status (admin only)
// @route   PUT /api/orders/:id/dispute
// @access  Private/Admin
const updateDispute = asyncHandler(async (req, res) => {
  const { status, resolution, adminNotes } = req.body;

  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('orderItems.seller', 'name email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (!req.user.isAdmin) {
    res.status(401);
    throw new Error('Only admins can update dispute status');
  }
  if (order.disputeStatus === 'none') {
    res.status(400);
    throw new Error('No dispute exists for this order');
  }

  const validStatuses = ['open', 'in_review', 'resolved', 'closed'];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid dispute status');
  }

  order.disputeStatus = status;
  order.dispute.status    = status;
  order.dispute.updatedAt = Date.now();
  if (resolution)  order.dispute.resolution  = resolution;
  if (adminNotes)  order.dispute.adminNotes  = adminNotes;
  if (['resolved','closed'].includes(status)) {
    order.dispute.resolvedAt = Date.now();
    order.dispute.resolvedBy = req.user._id;
  }

  const updated = await order.save();

  // notify both buyer and all sellers
  const allEmails = [
    order.user.email,
    ...order.orderItems.map(i => i.seller.email),
  ]
    .filter(Boolean)
    .filter(e => e !== req.user.email)    // don’t email yourself
    .filter((v,i,a) => a.indexOf(v)===i); // dedupe

  await Promise.all(
    allEmails.map(email =>
      sendNotificationEmail({
        to: email,
        subject: 'Dispute Status Updated',
        type: 'dispute_updated',
        orderData: {
          orderId: order._id,
          orderNumber: order._id.toString().slice(-8),
          status,
          resolution,
        },
      }).catch(err => console.error(`❌ Notify ${email}:`, err))
    )
  );

  res.json(updated);
});

// controller
export const getDisputes = asyncHandler(async (req, res) => {
// after
const statuses = ['open','in_review','resolved','closed'];
const disputes = await Order.find({
  disputeStatus: { $in: statuses },            // only known dispute statuses
  'dispute.createdAt': { $exists: true },      // ensure sub-doc exists
})
  .select('_id dispute')
  .populate('dispute.createdBy', 'name email')
  .sort({ 'dispute.createdAt': -1 });
  res.json(disputes);
});

// routes


// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.orderStatus = 'delivered';

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (order) {
    // Validate status values
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      res.status(400);
      throw new Error('Invalid order status');
    }

    order.orderStatus = status;
    
    // Update relevant fields based on status
    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    } else if (status === 'cancelled') {
      order.isCancelled = true;
      order.cancelledAt = Date.now();
    } else if (status === 'shipped') {
      order.isShipped = true;
      order.shippedAt = Date.now();
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    // Check if order belongs to user or user is admin
    if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      res.status(401);
      throw new Error('Not authorized to cancel this order');
    }

    // Check if order can be cancelled
    if (order.isPaid && order.isDelivered) {
      res.status(400);
      throw new Error('Cannot cancel delivered order');
    }

    order.isCancelled = true;
    order.cancelledAt = Date.now();
    order.orderStatus = 'cancelled';

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name');
  res.json(orders);
});

// @desc    Get orders with disputes
// @route   GET /api/orders/disputes
// @access  Private/Admin


// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private/Admin
const getOrderStats = asyncHandler(async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const paidOrders = await Order.countDocuments({ isPaid: true });
  const deliveredOrders = await Order.countDocuments({ isDelivered: true });
  const cancelledOrders = await Order.countDocuments({ isCancelled: true });
  const disputedOrders = await Order.countDocuments({ disputeStatus: { $ne: 'none' } });

  // Calculate total revenue
  const revenueResult = await Order.aggregate([
    { $match: { isPaid: true } },
    { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
  ]);
  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

  // Get monthly stats for the last 12 months
  const monthlyStats = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000) }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        orders: { $sum: 1 },
        revenue: { $sum: { $cond: [{ $eq: ['$isPaid', true] }, '$totalPrice', 0] } }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  res.json({
    totalOrders,
    paidOrders,
    deliveredOrders,
    cancelledOrders,
    disputedOrders,
    totalRevenue,
    monthlyStats
  });
});

// @desc    Get recent orders
// @route   GET /api/orders/recent
// @access  Private/Admin
const getRecentOrders = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  
  const recentOrders = await Order.find({})
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit);

  res.json(recentOrders);
});

// Fetch all orders that include this seller’s art
const getSellerOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    'orderItems.seller': req.user._id
  })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
  res.json(orders);
});
const getSellerNewSales = asyncHandler(async (req, res) => {
  const newSales = await Order.find({
    isCancelled: false,
    orderStatus: { $in: ['pending', 'processing', 'shipped'] },
    orderItems: { $elemMatch: { seller: req.user._id } },
  })
    .select('_id orderStatus createdAt totalPrice') // small payload for badge
    .sort({ createdAt: -1 });

  res.json(newSales);               // array; length === badge count
});

const getSellerOpenSales = asyncHandler(async (req, res) => {
  const openSales = await Order.find({
    orderItems: { $elemMatch: { seller: req.user._id } },
    orderStatus: { $ne: 'delivered' },   // anything still in progress
    isCancelled: false,
  }).select('_id');                      // small payload for badge

  res.json(openSales);
});


// @desc    Buyer confirms delivery
// @route   PUT /api/orders/:id/deliver
// @access  Private (Buyer)
// controllers/orderController.js
const confirmOrderDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')                 // buyer
    .populate('orderItems.seller', 'name email');   // 🟢 populate each seller

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (!order.isShipped) {
    res.status(400);
    throw new Error('Order must be shipped before you can confirm delivery');
  }

  // mark delivered
  order.isDelivered = true;
  order.deliveredAt = Date.now();
  order.orderStatus = 'delivered';
  const updatedOrder = await order.save();

  // 🟢 collect unique seller emails
  const sellerEmails = [
    ...new Set(order.orderItems.map((item) => item.seller?.email).filter(Boolean)),
  ];

  // notify each seller
  await Promise.all(
    sellerEmails.map(async (email) => {
      try {
        await sendNotificationEmail({
          to: email,
          type: 'order_delivered',
          orderData: { orderNumber: order._id.toString().slice(-8) },
        });
        console.log(`✅ Delivery email sent to seller ${email}`);
      } catch (err) {
        console.error(`❌ Delivery-notification failed for ${email}:`, err.message || err);
      }
    })
  );

  res.json(updatedOrder);
});




export {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateOrderToShipped,
  confirmOrderReceived,
  createDispute,
  updateDispute,
  updateOrderStatus,
  getOrders,

  cancelOrder,
  getOrderStats,
  getRecentOrders,
  getSellerOrders,
  confirmOrderDelivered,
  getSellerNewSales,
  getSellerOpenSales 
};