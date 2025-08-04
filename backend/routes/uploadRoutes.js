import path from 'path';
import express from 'express';
import multer from 'multer';
import asyncHandler from '../middleware/asyncHandler.js';   // ✅ ADD THIS LINE
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/userModel.js';                  // ✅ also make sure you import your User model
import { sendNotificationEmail} from '../utils/sendEmail.js';


const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`
    );
  },
});

function fileFilter(req, file, cb) {
  const filetypes = /jpe?g|png|webp/;
  const mimetypes = /image\/jpe?g|image\/png|image\/webp/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = mimetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Images only! Please upload JPEG, PNG, or WebP files.'), false);
  }
}

const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 10 // Maximum 10 files
  }
});

// Single image upload
const uploadSingleImage = upload.single('image');

// Multiple images upload (max 10)
const uploadMultipleImages = upload.array('images', 10);

// Single image upload route
router.post('/single',  protect, (req, res) => {
  uploadSingleImage(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    res.status(200).json({
      message: 'Image uploaded successfully',
      image: `/${req.file.path}`,
    });
  });
});


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

    // 1️⃣ Save artist profile and set pending flags
    user.artistProfile = {
      bio,
      artistStatement,
      location,
      photo: `/uploads/${req.file.filename}`,
    };
    user.isSeller       = true;
    user.sellerApproved = false;
    await user.save();

    // 2️⃣ Fetch admins
    let admins = await User.find({ isAdmin: true }).select('email name');
    if (!admins.length && process.env.ADMIN_EMAIL) {
      admins = [{ email: process.env.ADMIN_EMAIL, name: process.env.ADMIN_NAME || 'Admin' }];
      console.warn('⚠️ No admins in DB — falling back to ADMIN_EMAIL');
    }
    if (!admins.length) {
      console.error('❌ No admins found and no ADMIN_EMAIL configured');
      return res.json({ message: 'Seller request saved, but no admin can be notified.' });
    }

    // 3️⃣ Notify each admin
    await Promise.all(
      admins.map(async (admin) => {
        console.log(`📨 Emailing admin ${admin.email}`);
        try {
          await sendNotificationEmail({
            to: admin.email,
            type: 'sellerApprovalRequest',    // must match your template key
            orderData: {
              userName:  user.name,
              userEmail: user.email,
              adminName: admin.name,
            },
          });
          console.log(`✅ Email sent to ${admin.email}`);
        } catch (err) {
          console.error(`❌ Failed to email ${admin.email}:`, err.message || err);
        }
      })
    );

    // 4️⃣ Notify the user that their request is processing
    try {
      await sendNotificationEmail({
        to: user.email,
        type: 'sellerRequestProcessing',   // must match your template key
        orderData: { userName: user.name },
      });
      console.log(`✅ Processing email sent to user ${user.email}`);
    } catch (err) {
      console.error(`❌ Failed to email user ${user.email}:`, err.message || err);
    }

    // 5️⃣ Final response
    res.json({
      message: 'Seller request submitted successfully. Admins have been notified.',
    });
  })
);

// Multiple images upload route
router.post('/multiple',  protect, (req, res) => {
  uploadMultipleImages(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ message: 'Too many files. Maximum 10 files allowed.' });
      }
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum size is 5MB per file.' });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No image files provided' });
    }

    const uploadedImages = req.files.map(file => ({
      filename: file.filename,
      path: `/${file.path}`,
      size: file.size,
      mimetype: file.mimetype
    }));

    res.status(200).json({
      message: `${req.files.length} image(s) uploaded successfully`,
      images: uploadedImages,
      count: req.files.length
    });
  });
});

// Mixed fields upload route (for forms with both single and multiple image fields)
router.post('/mixed',  protect, (req, res) => {
  const uploadMixed = upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'gallery', maxCount: 9 }
  ]);

  uploadMixed(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ message: 'Too many files. Maximum 1 main image and 9 gallery images.' });
      }
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum size is 5MB per file.' });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    const result = {
      message: 'Files uploaded successfully',
      files: {}
    };

    if (req.files.mainImage && req.files.mainImage.length > 0) {
      result.files.mainImage = {
        filename: req.files.mainImage[0].filename,
        path: `/${req.files.mainImage[0].path}`,
        size: req.files.mainImage[0].size,
        mimetype: req.files.mainImage[0].mimetype
      };
    }

    if (req.files.gallery && req.files.gallery.length > 0) {
      result.files.gallery = req.files.gallery.map(file => ({
        filename: file.filename,
        path: `/${file.path}`,
        size: file.size,
        mimetype: file.mimetype
      }));
    }

    if (!req.files.mainImage && !req.files.gallery) {
      return res.status(400).json({ message: 'No image files provided' });
    }

    result.totalFiles = (req.files.mainImage?.length || 0) + (req.files.gallery?.length || 0);
    
    res.status(200).json(result);
  });
});

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
      photo: req.file ? `/uploads/${req.file.filename}` : user.artistProfile.photo,
    };

    await user.save();

    res.json({ message: 'Profile updated successfully', user });
  })
);


// Legacy route - maintains backward compatibility
router.post('/',  protect, (req, res) => {
  uploadSingleImage(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    res.status(200).json({
      message: 'Image uploaded successfully',
      image: `/${req.file.path}`,
    });
  });
});

export default router;