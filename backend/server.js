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

import { notFound, errorHandler } from './middleware/errorMiddleware.js';

if (process.env.NODE_ENV === 'production') {
  const noop = () => {};
  console.log = noop;
  console.debug = noop;
  console.info = noop;
  console.trace = noop;
  // keep warnings/errors:
  // console.warn and console.error remain
}
// Load environment variables
dotenv.config();
// Connect to database
connectDB();

const app = express();

// 1) Body parsing, cookies, CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// FIXED: Get your actual Render frontend URL
const allowedOrigins = [
  'http://localhost:3000',
  'https://voicesoncanvas.onrender.com',
  'https://voicesoncanvas-g4rb.onrender.com',
    'https://voicesoncanvas.africa',
  'https://www.voicesoncanvas.africa'
  // Add your actual frontend domain here
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.log('CORS blocked origin:', origin); // Add logging
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'], // Add Cookie header
};

app.use(cors(corsOptions));

// Add preflight handling for all routes
app.options('*', cors(corsOptions));

// Debug middleware
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Request Origin:', req.get('Origin'));
    console.log('Cookies:', req.cookies);
    console.log('Headers:', req.headers.cookie);
  }
  next();
});

// PING ENDPOINT - Add this before other routes
app.get('/api/ping', (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`Ping received at ${timestamp}`);
  res.status(200).json({ 
    success: true, 
    message: 'Server is awake', 
    timestamp,
    uptime: process.uptime()
  });
});

// Health check endpoint (alternative)
app.get('/api/health', (req, res) => {
  const timestamp = new Date().toISOString();
  res.status(200).json({
    status: 'healthy',
    timestamp,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    env: process.env.NODE_ENV
  });
});

// 2) API routes
app.use('/api/products', productRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/upload',   uploadRoutes);
app.use('/api/blogs',    blogRoutes);


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

// ---- Self-ping: run ALWAYS ----
const PING_INTERVAL = Number(process.env.PING_INTERVAL_MS) || 10 * 60 * 1000;

const baseUrl =
  process.env.BACKEND_URL ||
  process.env.RENDER_EXTERNAL_URL ||
  `http://localhost:${PORT}`;

setInterval(async () => {
  try {
    // Safely build the URL (handles trailing paths)
    const pingUrl = new URL('/api/ping', baseUrl).toString();
    const res = await fetch(pingUrl, { redirect: 'follow' });

    // Bail early on bad status
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} at ${res.url}`);

    // Ensure we actually got JSON (not SPA HTML)
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      const sample = (await res.text()).slice(0, 120);
      throw new Error(`Expected JSON, got ${ct}. url=${res.url}. body=${sample}`);
    }

    const data = await res.json();
    console.log('Self-ping OK:', data.timestamp);
  } catch (err) {
    console.error('Self-ping failed:', err.message);
  }
}, PING_INTERVAL);

