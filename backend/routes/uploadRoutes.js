import express from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import AWS from 'aws-sdk';
import asyncHandler from '../middleware/asyncHandler.js';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/userModel.js';
import { sendNotificationEmail } from '../utils/sendEmail.js';
import path from 'path';
import dotenv from 'dotenv';

const router = express.Router();


dotenv.config();
// Configure AWS S3 client
const {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION = 'eu-north-1',
  S3_BUCKET_NAME,
  ADMIN_EMAIL,
  ADMIN_NAME,
} = process.env;

if (!S3_BUCKET_NAME) {
  throw new Error('⚠️  Environment variable S3_BUCKET_NAME is not set');
}

// Configure AWS S3 client
const s3 = new AWS.S3({
  credentials: {
    accessKeyId:     AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
  region: AWS_REGION,
});

// Multer-S3 storage configuration
const upload = multer({
  storage: multerS3({
    s3,
    bucket: S3_BUCKET_NAME,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (_req, file, cb) => cb(null, { fieldName: file.fieldname }),
    key: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const filename = `${file.fieldname}-${Date.now()}${ext}`;
      cb(null, filename);
    },
  }),
  fileFilter: (_req, file, cb) => {
    const allowed = /jpe?g|png|webp/;
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;
    if (allowed.test(ext) && allowed.test(mime)) {
      cb(null, true);
    } else {
      cb(new Error('Images only! Please upload JPEG, PNG, or WebP files.'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
});



// Single image upload
router.post(
  '/single',
  protect,
  upload.single('image'),
  (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No image file provided' });
    res.status(200).json({ message: 'Image uploaded successfully', image: req.file.location });
  }
);

// Request seller with photo upload
router.post(
  '/request-seller',
  protect,
  upload.single('photo'),
  asyncHandler(async (req, res) => {
    console.log('📥 Seller request hit:', req.body, req.file);
    const { bio, artistStatement, location } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    user.artistProfile = {
      bio,
      artistStatement,
      location,
      photo: req.file ? req.file.location : undefined,
    };
    user.isSeller = true;
    user.sellerApproved = false;
    await user.save();
    let admins = await User.find({ isAdmin: true }).select('email name');
    if (!admins.length && process.env.ADMIN_EMAIL) {
      admins = [{ email: process.env.ADMIN_EMAIL, name: process.env.ADMIN_NAME || 'Admin' }];
      console.warn('⚠️ No admins in DB — falling back to ADMIN_EMAIL');
    }
    if (!admins.length) {
      console.error('❌ No admins found and no ADMIN_EMAIL configured');
      return res.json({ message: 'Seller request saved, but no admin can be notified.' });
    }
    await Promise.all(
      admins.map(async (admin) => {
        await sendNotificationEmail({
          to: admin.email,
          type: 'sellerApprovalRequest',
          orderData: { userName: user.name, userEmail: user.email, adminName: admin.name },
        });
      })
    );
    await sendNotificationEmail({
      to: user.email,
      type: 'sellerRequestProcessing',
      orderData: { userName: user.name },
    });
    res.json({ message: 'Seller request submitted successfully. Admins have been notified.' });
  })
);

// Multiple images upload
router.post(
  '/multiple',
  protect,
  upload.array('images', 10),
  (req, res) => {
    if (!req.files || !req.files.length) return res.status(400).json({ message: 'No image files provided' });
    const images = req.files.map((file) => file.location);
    res.status(200).json({ message: `${images.length} image(s) uploaded successfully`, images });
  }
);

// Mixed fields upload
router.post(
  '/mixed',
  protect,
  upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'gallery', maxCount: 9 },
  ]),
  (req, res) => {
    const files = req.files;
    if (!files || (!files.mainImage && !files.gallery)) {
      return res.status(400).json({ message: 'No image files provided' });
    }
    const result = {};
    if (files.mainImage) result.mainImage = files.mainImage[0].location;
    if (files.gallery) result.gallery = files.gallery.map((f) => f.location);
    res.status(200).json({ message: 'Files uploaded successfully', files: result });
  }
);

// Artist profile update with photo
router.put(
  '/artist-profile',
  protect,
  upload.single('photo'),
  asyncHandler(async (req, res) => {
    const { bio, artistStatement, location } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    user.artistProfile = {
      ...user.artistProfile,
      bio,
      artistStatement,
      location,
      photo: req.file ? req.file.location : user.artistProfile.photo,
    };
    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  })
);

// Legacy single upload route
router.post(
  '/',
  protect,
  upload.single('image'),
  (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No image file provided' });
    res.status(200).json({ message: 'Image uploaded successfully', image: req.file.location });
  }
);

export default router;
