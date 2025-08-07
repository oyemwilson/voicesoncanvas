import express from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import AWS from 'aws-sdk';
import asyncHandler from '../middleware/asyncHandler.js';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/userModel.js';
import { sendNotificationEmail } from '../utils/sendEmail.js';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';
import dotenv from 'dotenv';

const router = express.Router();

dotenv.config();

// Validate required environment variables

/* 1. Configure Cloudinary once */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* 2. Tell multer to send files straight to Cloudinary */
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'voicesoncanvas',              // will be created automatically
    allowed_formats: ['jpg','jpeg','png','webp'],
    transformation: [{ quality:'auto', fetch_format:'auto' }], // WebP/AVIF + compression
  },
});

const upload = multer({ storage });
// Single image upload
// Replace your /single route with this more robust version:

router.post(
  '/single',
  protect,
  (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err) {
        console.error('❌ Multer error:', err);
        return handleMulterError(err, req, res, next);
      }
      
      if (!req.file) {
        console.error('❌ No file in request');
        return res.status(400).json({ message: 'No image file provided' });
      }
      
      // 🔍 Extract image URL from various possible properties
      const imageUrl = req.file.location || 
                      req.file.secure_url || 
                      req.file.url || 
                      req.file.path;
                      
      const filename = req.file.key || 
                      req.file.public_id || 
                      req.file.filename || 
                      req.file.originalname;
      
      console.log('📷 Extracted imageUrl:', imageUrl);
      console.log('📷 Extracted filename:', filename);
      
      if (!imageUrl) {
        console.error('❌ No valid image URL found in req.file:', Object.keys(req.file));
        return res.status(500).json({ 
          message: 'Image upload failed - no URL generated',
          debug: Object.keys(req.file)
        });
      }
      
      res.status(200).json({ 
        message: 'Image uploaded successfully', 
        image: imageUrl,
        filename: filename
      });
    });
  }
);

// Request seller with photo upload
router.post(
  '/request-seller',
  protect,
  (req, res, next) => {
    upload.single('photo')(req, res, async (err) => {
      if (err) return handleMulterError(err, req, res, next);
      
      try {
        console.log('📥 Seller request hit:', req.body, req.file);
        const { bio, artistStatement, location } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
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
      } catch (error) {
        console.error('Seller request error:', error);
        res.status(500).json({ message: 'Server error processing seller request' });
      }
    });
  }
);

// Multiple images upload
router.post(
  '/multiple',
  protect,
  (req, res, next) => {
    upload.array('images', 10)(req, res, (err) => {
      if (err) return handleMulterError(err, req, res, next);
      
      if (!req.files || !req.files.length) {
        return res.status(400).json({ message: 'No image files provided' });
      }
      
      const images = req.files.map((file) => ({ 
        url: file.location, 
        filename: file.key 
      }));
      
      res.status(200).json({ 
        message: `${images.length} image(s) uploaded successfully`, 
        images 
      });
    });
  }
);

// Mixed fields upload
router.post(
  '/mixed',
  protect,
  (req, res, next) => {
    upload.fields([
      { name: 'mainImage', maxCount: 1 },
      { name: 'gallery', maxCount: 9 },
    ])(req, res, (err) => {
      if (err) return handleMulterError(err, req, res, next);
      
      const files = req.files;
      if (!files || (!files.mainImage && !files.gallery)) {
        return res.status(400).json({ message: 'No image files provided' });
      }
      
      const result = {};
      if (files.mainImage) {
        result.mainImage = { 
          url: files.mainImage[0].location, 
          filename: files.mainImage[0].key 
        };
      }
      if (files.gallery) {
        result.gallery = files.gallery.map((f) => ({ 
          url: f.location, 
          filename: f.key 
        }));
      }
      
      res.status(200).json({ 
        message: 'Files uploaded successfully', 
        files: result 
      });
    });
  }
);

// Artist profile update with photo
router.put(
  '/artist-profile',
  protect,
  (req, res, next) => {
    upload.single('photo')(req, res, async (err) => {
      if (err) return handleMulterError(err, req, res, next);
      
      try {
        const { bio, artistStatement, location } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        user.artistProfile = {
          ...user.artistProfile,
          bio,
          artistStatement,
          location,
          photo: req.file ? req.file.location : user.artistProfile?.photo,
        };
        await user.save();
        res.json({ message: 'Profile updated successfully', user });
      } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Server error updating profile' });
      }
    });
  }
);

// Legacy single upload route
router.post(
  '/',
  protect,
  (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err) return handleMulterError(err, req, res, next);
      
      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
      }
      
      res.status(200).json({ 
        message: 'Image uploaded successfully', 
        image: req.file.location,
        filename: req.file.key 
      });
    });
  }
);

// Health check route to verify S3 connection
router.get('/health', asyncHandler(async (req, res) => {
  try {
    await s3.headBucket({ Bucket: process.env.S3_BUCKET_NAME }).promise();
    res.json({ 
      status: 'OK', 
      bucket: process.env.S3_BUCKET_NAME, 
      region: process.env.AWS_REGION 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'S3 bucket not accessible',
      error: error.message 
    });
  }
}));

export default router;