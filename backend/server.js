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

dotenv.config();
connectDB();

const app = express();

// 1) Body parsing + cookies + CORS
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

// 2) Your API routes
app.use('/api/products', productRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/upload',   uploadRoutes);
app.use('/api/blogs',    blogRoutes);
app.use('/api/dhl',      dhlRoutes);

// 3) Pay config endpoints
app.get('/api/config/paypal',  (req, res) => res.send({ clientId: process.env.PAYPAL_CLIENT_ID }));
app.get('/api/config/paystack', (req, res) => res.send({ publicKey:  process.env.REACT_APP_PAYSTACK_PUBLIC_KEY }));

// 4) Serve uploads folder
if (process.env.NODE_ENV === 'production') {
  // In prod, uploads are in /var/data/uploads
  app.use('/uploads', express.static('/var/data/uploads'));
} else {
  // In dev, uploads live in ./uploads
  app.use('/uploads', express.static(path.join(path.resolve(), 'uploads')));
}

// 5) Serve React build & client-side routing
if (process.env.NODE_ENV === 'production') {
  const __dirname = path.resolve();
  const clientBuildPath = path.join(__dirname, 'frontend', 'build');

  // Static files
  app.use(express.static(clientBuildPath));

  // Catch-all to index.html (skip API and uploads)
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

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
