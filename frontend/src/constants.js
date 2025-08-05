// export const BASE_URL =
//   process.env.NODE_ENV === 'develeopment' ? 'http://localhost:5000' : '';
// src/utils/api.js
export const BASE_URL = 
  process.env.NODE_ENV === 'production' 
    ? 'https://voicesoncanvas1.onrender.com'  // Your backend URL
    : 'http://localhost:5001';

export const PRODUCTS_URL = '/api/products';
export const USERS_URL = '/api/users';
export const ORDERS_URL = '/api/orders';
export const PAYPAL_URL = '/api/config/paypal';
export const WISHLIST_URL = '/api/users/wishlist';


