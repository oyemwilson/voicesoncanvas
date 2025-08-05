import fs from 'fs';
import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './config/db.js';

import productRoutes from './routes/productRoutes.js';
import userRoutes    from './routes/userRoutes.js';
import orderRoutes   from './routes/orderRoutes.js';
import uploadRoutes  from './routes/uploadRoutes.js';
import blogRoutes    from './routes/blogRoutes.js';
import dhlRoutes     from './routes/dhlRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();
// Connect to database
connectDB();

const app = express();

// 1) Body parsing, cookies, CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://voicesoncanvas.onrender.com',
    'https://voicesoncanvas1.onrender.com',
  ],
  credentials: true,
}));

// 2) API routes
app.use('/api/products', productRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/upload',   uploadRoutes);
app.use('/api/blogs',    blogRoutes);
app.use('/api/dhl',      dhlRoutes);

// 3) Payment configuration endpoints
app.get('/api/config/paypal', (req, res) => {
  res.send({ clientId: process.env.PAYPAL_CLIENT_ID });
});
app.get('/api/config/paystack', (req, res) => {
  res.send({ publicKey: process.env.REACT_APP_PAYSTACK_PUBLIC_KEY });
});

// 4) Ensure uploads directory exists and serve it
const uploadDir = path.join(path.resolve(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Created uploads directory at ${uploadDir}`);
}
app.use('/uploads', express.static(uploadDir));

// 5) Serve React build & SPA fallback (production only)
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(path.resolve(), 'frontend', 'build');

  // Serve static assets
  app.use(express.static(clientBuildPath));

  // All other GETs not matching API or uploads -> index.html
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// 6) 404 + error handlers
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
