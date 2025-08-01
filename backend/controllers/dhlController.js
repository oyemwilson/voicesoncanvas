import axios from 'axios';
import asyncHandler from '../middleware/asyncHandler.js';
import Order from '../models/orderModel.js';

// Load env vars
const {
  DHL_CLIENT_ID,
  DHL_CLIENT_SECRET,
  DHL_API_BASE
} = process.env;

// Helper to get OAuth token from DHL
async function getDhlToken() {
  const resp = await axios.post(
    `${DHL_API_BASE}/oauth/token`,
    'grant_type=client_credentials',
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      auth: { username: DHL_CLIENT_ID, password: DHL_CLIENT_SECRET }
    }
  );
  return resp.data.access_token;
}

/**
 * Plain function to book a DHL shipment.
 * Can be called from any controller logic.
 * Returns the tracking number.
 */
export async function bookDhlShipment(orderId) {
  // Fetch the order
  const order = await Order.findById(orderId);
  if (!order) throw new Error('Order not found');

  const token = await getDhlToken();

  // Build DHL payload per their API docs
  const payload = {
    plannedShippingDateAndTime: new Date().toISOString(),
    pickup: { /* TODO: your pickup location */ },
    delivery: {
      address: {
        streetLines: [order.shippingAddress.address],
        city: order.shippingAddress.city,
        postalCode: order.shippingAddress.postalCode,
        countryCode: order.shippingAddress.country
      },
      contact: { /* TODO: name, phone, email */ }
    },
    content: {
      description: 'Order ' + order._id
      // TODO: weight, dimensions, etc.
    },
    customerDetails: {
      shipperDetails: { /* TODO: your company info */ },
      receiverDetails: { /* same as delivery.address */ }
    }
  };

  const { data } = await axios.post(
    `${DHL_API_BASE}/transportation/shipment/v1/bookings`,
    payload,
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

  const trackingNumber = data.shipmentTrackingNumber;

  // Persist to order
  order.trackingNumber = trackingNumber;
  order.shippingStatus = 'pending';
  order.shippingStatusUpdatedAt = new Date();
  await order.save();

  return trackingNumber;
}

/**
 * Express handler: create a DHL shipment via bookDhlShipment helper
 */
export const createDhlShipmentHandler = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) return res.status(400).json({ message: 'orderId is required' });

  const trackingNumber = await bookDhlShipment(orderId);
  res.status(201).json({ trackingNumber });
});

/**
 * Express handler: poll DHL tracking status and update order
 */
export const pollDhlTrackingHandler = asyncHandler(async (req, res) => {
  const { trackingNumber } = req.params;
  const order = await Order.findOne({ trackingNumber });
  if (!order) return res.status(404).json({ message: 'Order not found' });

  const token = await getDhlToken();
  const { data } = await axios.get(
    `${DHL_API_BASE}/transportation/shipment/v1/track/shipments?trackingNumber=${trackingNumber}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const latestEvent = data.shipments?.[0]?.events?.slice(-1)[0];
  if (latestEvent) {
    const statusMap = {
      PU: 'picked',
      DP: 'in_transit',
      AR: 'in_transit',
      OD: 'delivered',
      DE: 'delivered'
    };
    const newStatus = statusMap[latestEvent.eventCode] || order.shippingStatus;
    order.shippingStatus = newStatus;
    order.shippingStatusUpdatedAt = new Date(latestEvent.timestamp);
    await order.save();
  }

  res.json({ shippingStatus: order.shippingStatus, updatedAt: order.shippingStatusUpdatedAt });
});
