import jwt from 'jsonwebtoken';
import asyncHandler from './asyncHandler.js';
import User from '../models/userModel.js';

// User must be authenticated
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Read JWT from the 'jwt' cookie
  token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.userId).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// User must be an admin
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};
const approvedSeller = asyncHandler(async (req, res, next) => {
  // Check if user is authenticated (assumes auth middleware runs first)
  if (!req.user) {
    res.status(401);
    throw new Error('Not authenticated');
  }

  // Get fresh user data to ensure seller status is current
  const user = await User.findById(req.user._id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if user is a seller
  if (!user.isSeller) {
    res.status(403);
    throw new Error('Access denied. You need to become a seller first. Please apply to become a seller.');
  }

  // Check if seller is approved
  if (!user.sellerApproved) {
    res.status(403);
    throw new Error('Access denied. Your seller account is pending approval. Please wait for admin approval.');
  }

  // If all checks pass, continue to next middleware/route
  next();
});

export { protect, admin, approvedSeller };
