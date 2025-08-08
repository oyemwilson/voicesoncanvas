import asyncHandler from '../middleware/asyncHandler.js';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import { calcPrices } from '../utils/calcPrices.js';
import User     from '../models/userModel.js'
import { verifyPayPalPayment, checkIfNewTransaction } from '../utils/paypal.js';
import { sendTemplateEmail, sendNotificationEmail } from '../utils/sendEmail.js'

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, packagingOption } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // 1️⃣ Build "trusted" order items from DB prices
  const itemsFromDB = await Product.find({
    _id: { $in: orderItems.map(x => x._id) }
  });

  const dbOrderItems = orderItems.map(item => {
    const prod = itemsFromDB.find(p => p._id.toString() === item._id);
    return {
      ...item,
      seller: prod.user || prod.seller, // your seller field
      product: item._id,
      price: prod.price,
      _id: undefined
    };
  });

  // 2️⃣ Calculate totals (now includes serviceFee)
  const { itemsPrice, serviceFee, taxPrice, shippingPrice, totalPrice } = calcPrices(dbOrderItems);

  // 3️⃣ Create & save the order
  const order = new Order({
    orderItems: dbOrderItems,
    user: req.user._id,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    serviceFee, // Add serviceFee to the order
    taxPrice,
    shippingPrice,
    totalPrice,
    packagingOption: packagingOption || 'Standard',
    orderStatus: 'pending',
    disputeStatus: 'none',
  });

  const createdOrder = await order.save();

  // 4️⃣ Send confirmation to **buyer**
  try {
    const buyer = await User.findById(req.user._id).select('email name');

    await sendNotificationEmail({
      to: buyer.email,
      type: 'paymentReminder', // <-- new template key
      orderData: {
        customerName: buyer.name,
        orderId: createdOrder._id.toString()
      }
    });

    console.log(`✅ Payment reminder sent to ${buyer.email}`);
  } catch (err) {
    console.error('❌ Failed to send payment reminder:', err);
  }

  // 6️⃣ Return the created order
  res.status(201).json(createdOrder);
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

  // 1️⃣ Payment verification (PayPal only)
  if (paymentGateway === 'paypal') {
    const { verified } = await verifyPayPalPayment(req.body.id);
    if (!verified) throw new Error('Payment not verified');
    const isNewTxn = await checkIfNewTransaction(Order, req.body.id);
    if (!isNewTxn) throw new Error('Transaction used before');
  }

  // 2️⃣ Load order with buyer info
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // 3️⃣ Mark as paid
  order.isPaid      = true;
  order.paidAt      = Date.now();
  order.orderStatus = 'processing';
  order.paymentResult = {
    id:            req.body.id || req.body.reference,
    status:        req.body.status || 'success',
    email_address: req.body.payer?.email_address || req.body.email,
  };

  // 4️⃣ Decrement stock
  for (const item of order.orderItems) {
    const product = await Product.findById(item.product);
    if (product) {
      product.countInStock = Math.max(product.countInStock - item.qty, 0);
      await product.save();
    }
  }

  // 5️⃣ Save the updated order
  const updatedOrder = await order.save();

  // 6️⃣ Notify the **buyer** that their payment succeeded
  try {
    await sendTemplateEmail({
      to: updatedOrder.user.email,
      templateName: 'orderConfirmation',   // reuse your existing Order Confirmation template
      templateData: {
        customerName: updatedOrder.user.name,
        orderId:      updatedOrder._id,
        total:        updatedOrder.totalPrice,
        items:        updatedOrder.orderItems.map(i => ({
          name: i.name,
          qty:  i.qty,
          price:i.price
        }))
      }
    });
    console.log(`✅ Buyer payment confirmation sent to ${updatedOrder.user.email}`);
  } catch (err) {
    console.error(`❌ Failed to send buyer payment email:`, err);
  }

  // 7️⃣ Notify each **seller**
  const sellerIds = [
    ...new Set(updatedOrder.orderItems.map(i => i.seller.toString()))
  ];

  await Promise.all(sellerIds.map(async sellerId => {
    const seller = await User.findById(sellerId).select('name email');
    if (!seller?.email) return;

    try {
      await sendNotificationEmail({
        to: seller.email,
        type: 'payment_received',   // matches emailTemplates.payment_received
        orderData: {
          orderNumber:     updatedOrder._id.toString().slice(-8),
          totalPrice:      updatedOrder.totalPrice,
          shippingAddress: updatedOrder.shippingAddress,
        }
      });
      console.log(`✅ Payment notification sent to seller ${seller.email}`);
    } catch (err) {
      console.error(`❌ Failed to notify seller ${seller.email}:`, err);
    }
  }));

  // 8️⃣ Return the newly updated order
  res.json(updatedOrder);
});




// @desc    Update order with shipping details
// @route   PUT /api/orders/:id/ship
// @access  Private (Seller only)
const updateOrderToShipped = asyncHandler(async (req, res) => {
  const { trackingNumber, carrier, shippingDate } = req.body;

  // 1️⃣ Load order + buyer email
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // 2️⃣ Authorization check
  if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(401);
    throw new Error('Not authorized to update this order');
  }

  // 3️⃣ Ensure paid
  if (!order.isPaid) {
    res.status(400);
    throw new Error('Order must be paid before shipping');
  }

  // 4️⃣ Update shipping fields
  order.isShipped       = true;
  order.shippedAt       = shippingDate || Date.now();
  order.orderStatus     = 'shipped';
  order.shippingDetails = {
    trackingNumber,
    carrier:   carrier || 'Standard Shipping',
    shippedAt: shippingDate || Date.now(),
  };

  const updatedOrder = await order.save();

  // 5️⃣ Notify the buyer
  const buyerEmail = order.user.email;
  if (buyerEmail) {
    try {
      await sendNotificationEmail({
        to: buyerEmail,
        type: 'order_shipped',  
        orderData: {
          orderNumber:    order._id.toString().slice(-8),
          trackingNumber,
          carrier,
        }
      });
      console.log(`✅ Shipping notification sent to buyer ${buyerEmail}`);
    } catch (err) {
      console.error(`❌ Failed to send shipping email to buyer ${buyerEmail}:`, err);
    }
  } else {
    console.warn('⚠️  No buyer email found—skipping shipping notification');
  }

  // 6️⃣ Return updated order
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
const sellerEmails = [ 
  ...new Set(order.orderItems.map(i => i.seller.email)) 
]
  // Notify seller that order has been confirmed as received
  try {
    await sendNotificationEmail({
      to: email,
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

  // 1️⃣ Load order + buyer + sellers
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('orderItems.seller', 'name email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // 2️⃣ Authorization
  const isBuyer  = order.user._id.equals(req.user._id);
  const isSeller = order.orderItems.some(i => i.seller._id.equals(req.user._id));
  if (!isBuyer && !isSeller && !req.user.isAdmin) {
    res.status(401);
    throw new Error('Not authorized to create dispute for this order');
  }

  // 3️⃣ Prevent duplicates
  if (order.disputeStatus !== 'none') {
    res.status(400);
    throw new Error('Dispute already exists for this order');
  }

  // 4️⃣ Validate reason
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

  // 5️⃣ Embed & save dispute
  order.disputeStatus = 'open';
  order.dispute = {
    reason,
    description,
    disputeType: disputeType || 'general',
    createdBy:   req.user._id,
    createdAt:   Date.now(),
    status:      'open',
  };
  const updatedOrder = await order.save();

  // 🔹🔹 Notify the requester that we’ve received their dispute
  try {
    await sendNotificationEmail({
      to:   updatedOrder.user.email,
      type: 'disputeRequestReceived',   // new template key you added
      orderData: {
        orderNumber: updatedOrder._id.toString().slice(-8),
      },
    });
    console.log(`✅ Dispute receipt email sent to ${updatedOrder.user.email}`);
  } catch (err) {
    console.error(`❌ Failed to send dispute-received email to user:`, err.message);
  }

  // 6️⃣ Notify all admins
  let admins = await User.find({ isAdmin: true }).select('email name');
  if (!admins.length && process.env.ADMIN_EMAIL) {
    admins = [{
      email: process.env.ADMIN_EMAIL,
      name:  process.env.ADMIN_NAME || 'Admin',
    }];
  }
  if (admins.length) {
    await Promise.all(admins.map(async admin => {
      try {
        await sendNotificationEmail({
          to: admin.email,
          type: 'dispute_created',
          orderData: {
            orderNumber: updatedOrder._id.toString().slice(-8),
            reason,
            description,
            createdBy: req.user.name || req.user.email,
          },
        });
        console.log(`✅ Dispute email sent to admin ${admin.email}`);
      } catch (err) {
        console.error(`❌ Failed to notify admin ${admin.email}:`, err.message);
      }
    }));
  } else {
    console.warn('⚠️ No admins configured—skipping admin notifications');
  }

  // 7️⃣ Notify the counter-party(ies)
  const recipients = Array.from(new Set(
    isBuyer
      ? order.orderItems.map(i => i.seller.email)
      : [order.user.email]
  )).filter(email => email && email !== req.user.email);

  await Promise.all(recipients.map(async email => {
    try {
      await sendNotificationEmail({
        to: email,
        type: 'dispute_notification',
        orderData: {
          orderNumber: updatedOrder._id.toString().slice(-8),
          reason,
        },
      });
      console.log(`✅ Dispute notification sent to ${email}`);
    } catch (err) {
      console.error(`❌ Failed to notify ${email}:`, err.message);
    }
  }));

  // 8️⃣ Return updated order
  res.json(updatedOrder);
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
const getDisputes = asyncHandler(async (req, res) => {
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
  const order = await Order.findById(req.params.id)

  if (!order) {
    res.status(404)
    throw new Error('Order not found')
  }

  // 1️⃣ mark as delivered
  order.isDelivered   = true
  order.deliveredAt   = Date.now()
  order.orderStatus   = 'delivered'
  const updatedOrder  = await order.save()

  // 2️⃣ notify the buyer
  try {
    const buyer = await User.findById(order.user).select('email name')
await sendNotificationEmail({
  to: buyer.email,
  type: 'order_delivered_buyer',
  orderData: {
    orderNumber: order._id.toString().slice(-8),
    deliveredAt: order.deliveredAt
  }
});
    console.log(`✅ Delivery email sent to buyer ${buyer.email}`)
  } catch (err) {
    console.error(`❌ Failed to send delivery email to buyer:`, err)
  }

  // 3️⃣ notify each seller
  // collect unique seller IDs from the order items
  const sellerIds = [
    ...new Set(order.orderItems.map(item => item.seller.toString()))
  ]
  const sellers = await User.find({ _id: { $in: sellerIds } }).select('email name')

  await Promise.all(sellers.map(async seller => {
    // filter only the items that belong to this seller
    const theirItems = order.orderItems.filter(
      i => i.seller.toString() === seller._id.toString()
    )

    try {
await sendNotificationEmail({
  to: seller.email,
  type: 'order_delivered',
  orderData: {
    orderNumber: order._id.toString().slice(-8),
    items: theirItems.map(i=>({ name:i.name, qty:i.qty, price:i.price }))
        }
      })
      console.log(`✅ Delivered-notification sent to seller ${seller.email}`)
    } catch (err) {
      console.error(`❌ Failed to email seller ${seller.email}:`, err)
    }
  }))

  // 4️⃣ respond
  res.json(updatedOrder)
})


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
  getDisputes,
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