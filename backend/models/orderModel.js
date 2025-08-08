import mongoose from 'mongoose';

const { Schema } = mongoose;

// Subdocument for individual order items
const orderItemSchema = new Schema({
  name:        { type: String, required: true },
  qty:         { type: Number, required: true },
  image:       { type: String, required: true },
  price:       { type: Number, required: true },
  seller:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
  product:     { type: Schema.Types.ObjectId, ref: 'Product', required: true },
});

// Subdocument for dispute details
const disputeSchema = new Schema({
  reason:      { type: String, enum: ['item_not_received','item_not_as_described','damaged_item','wrong_item','payment_issue','other'] },
  description: { type: String },
  disputeType: { type: String, default: 'general' },
  createdBy:   { type: Schema.Types.ObjectId, ref: 'User' },
  status:      { type: String, enum: ['open','in_review','resolved','closed'], default: 'open' },
  createdAt:   { type: Date },
  updatedAt:   { type: Date },
  resolvedAt:  { type: Date },
  resolvedBy:  { type: Schema.Types.ObjectId, ref: 'User' },
  resolution:  { type: String },
  adminNotes:  { type: String },
}, { _id: false });

// Subdocument for shipping details
const shippingDetailsSchema = new Schema({
  trackingNumber:          { type: String },
  carrier:                 { type: String },
  shippedAt:               { type: Date },
  shippingStatus:          { type: String, enum: ['pending','picked','in_transit','delivered','failed'], default: 'pending' },
  shippingStatusUpdatedAt: { type: Date }
}, { _id: false });

const orderSchema = new Schema({
  user:             { type: Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems:       { type: [orderItemSchema], required: true },

  shippingAddress:  {
    address:       { type: String, required: true },
    city:          { type: String, required: true },
    state:         { type: String },
    postalCode:    { type: String, required: true },
    country:       { type: String, required: true },
    phone:         { type: String }
  },

  paymentMethod:    { type: String, required: true, enum: ['PayPal','Stripe','Cash','Bank Transfer','Card'] },
  paymentResult:    {
    id:            { type: String },
    status:        { type: String },
    update_time:   { type: String },
    email_address: { type: String }
  },

  itemsPrice:       { type: Number, required: true, default: 0.0 },
  taxPrice:         { type: Number, required: true, default: 0.0 },
  shippingPrice:    { type: Number, required: true, default: 0.0 },
  packagingOption:  { type: String, enum: ['Standard','ArtSafe'], default: 'Standard' },
  totalPrice:       { type: Number, required: true, default: 0.0 },
  discountAmount:   { type: Number, default: 0.0 },
  couponCode:       { type: String },
  serviceFee: {
  type: Number,
  required: true,
  default: 0.00
},

  isPaid:           { type: Boolean, required: true, default: false },
  paidAt:           { type: Date },

  isCancelled:      { type: Boolean, default: false },
  cancelledAt:      { type: Date },

  // Shipping Workflow
  isShipped:        { type: Boolean, default: false },
  shippingDetails:  shippingDetailsSchema,

  // Buyer Confirmation
  isReceived:       { type: Boolean, default: false },
  receivedAt:       { type: Date },

  // Order status
  orderStatus:      { type: String, required: true, enum: ['pending','processing','shipped','delivered','cancelled'], default: 'pending' },

  // Refunds
  refundAmount:     { type: Number, default: 0 },
  refundReason:     { type: String },
  refundedAt:       { type: Date },

  notes:            { type: String },

  // Dispute system
  disputeStatus:    { type: String, enum: ['none','open','in_review','resolved','closed'], default: 'none' },
  dispute:          disputeSchema,
}, { timestamps: true });

// Indexes
orderSchema.index({ user: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ isPaid: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'orderItems.product': 1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;
