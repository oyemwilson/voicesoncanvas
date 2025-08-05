import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  // Set JWT as an HTTP-Only cookie with proper production settings
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // ✅ Fixed: use secure in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // ✅ Fixed
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    // Add these for production
    //  domain: 'voicesoncanvas1.onrender.com',
    path: '/',
  });

  return token;
};

export default generateToken;