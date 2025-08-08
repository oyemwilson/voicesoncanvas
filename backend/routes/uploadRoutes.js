import express from 'express';
import multer from 'multer';
import asyncHandler from '../middleware/asyncHandler.js';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/userModel.js';
import { sendNotificationEmail } from '../utils/sendEmail.js';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

const router = express.Router();

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'voicesoncanvas',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  },
});

const upload = multer({ storage });

// Error handler for multer errors
const handleMulterError = (err, req, res, next) => {
  console.error('Multer error:', err);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'Unexpected field name' });
    }
  }
  res.status(500).json({ message: 'Upload error', error: err.message });
};

// Helper function to extract image URL from file object
const extractImageUrl = (file) => {
  return file.path || file.secure_url || file.url || file.location;
};

// Helper function to extract filename from file object
const extractFilename = (file) => {
  return file.public_id || file.key || file.filename || file.originalname;
};

// Single image upload
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
      
      const imageUrl = extractImageUrl(req.file);
      const filename = extractFilename(req.file);
      
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
        
        // Extract image URL if file is uploaded
        let photoUrl = null;
        if (req.file) {
          photoUrl = extractImageUrl(req.file);
        }
        
        // Update user profile
        user.artistProfile = {
          ...user.artistProfile,
          bio,
          artistStatement,
          location,
          ...(photoUrl && { photo: photoUrl })
        };
        
        user.isSeller = true;
        user.sellerApproved = false;
        await user.save();
        
        // Find admins for notification
        let admins = await User.find({ isAdmin: true }).select('email name');
        if (!admins.length && process.env.ADMIN_EMAIL) {
          admins = [{ email: process.env.ADMIN_EMAIL, name: process.env.ADMIN_NAME || 'Admin' }];
          console.warn('⚠️ No admins in DB — falling back to ADMIN_EMAIL');
        }
        
        if (!admins.length) {
          console.error('❌ No admins found and no ADMIN_EMAIL configured');
          return res.json({ message: 'Seller request saved, but no admin can be notified.' });
        }
        
        // Send notification emails
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
        url: extractImageUrl(file), 
        filename: extractFilename(file)
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
          url: extractImageUrl(files.mainImage[0]), 
          filename: extractFilename(files.mainImage[0])
        };
      }
      if (files.gallery) {
        result.gallery = files.gallery.map((f) => ({ 
          url: extractImageUrl(f), 
          filename: extractFilename(f)
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
        
        // Extract image URL if file is uploaded
        let photoUrl = null;
        if (req.file) {
          photoUrl = extractImageUrl(req.file);
        }
        
        // Update user profile
        user.artistProfile = {
          ...user.artistProfile,
          bio,
          artistStatement,
          location,
          ...(photoUrl && { photo: photoUrl })
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
      
      const imageUrl = extractImageUrl(req.file);
      const filename = extractFilename(req.file);
      
      res.status(200).json({ 
        message: 'Image uploaded successfully', 
        image: imageUrl,
        filename: filename
      });
    });
  }
);

// Health check route for Cloudinary
router.get('/health', asyncHandler(async (req, res) => {
  try {
    // Test Cloudinary connection
    const result = await cloudinary.api.ping();
    res.json({ 
      status: 'OK', 
      service: 'Cloudinary',
      response: result
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Cloudinary not accessible',
      error: error.message 
    });
  }
}));

export default router;