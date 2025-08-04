import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      postalCode: { type: String, trim: true },
      country: { type: String, trim: true },
    },
    dateOfBirth: {
      type: Date,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      required: true,
      default: false,
    },

    // Email verification OTP fields
    otp: {
      type: String,

    },
    otpExpiry: {
      type: Date,
 
    },

    // Password reset OTP fields
    passwordResetOTP: {
      type: String,

    },
    passwordResetOTPExpiry: {
      type: Date,

    },

    // Password reset token fields (generated after OTP verification)
    passwordResetToken: {
      type: String,

    },
    passwordResetTokenExpiry: {
      type: Date,

    },
    isFeaturedArtist: {
      type: Boolean,
      default: false,
    },
    artistProfile: {
      bio: { type: String, trim: true },
      photo: { type: String },
      artistStatement: { type: String, trim: true },
      availableWorks: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
      ],
      location: {
        type: String,
        trim: true,
      },
    },




    // Account status
    isActive: {
      type: Boolean,
      default: true,
    },
    isSeller: { type: Boolean, default: false }, // once they request
    sellerApproved: { type: Boolean, default: false }, // admin must approve

    // Last login tracking
    lastLogin: {
      type: Date,
    },

    // Preferences
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      smsNotifications: {
        type: Boolean,
        default: false,
      },
      marketingEmails: {
        type: Boolean,
        default: true,
      },
    },

    // Profile picture
    avatar: {
      type: String,
    },

    // Wishlist
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],

    // Cart
    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],

    // Recently viewed products
    recentlyViewed: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance

userSchema.index({ createdAt: -1 });
userSchema.index({ isEmailVerified: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ lastLogin: -1 });

// TTL indexes for automatic cleanup of expired tokens/OTPs
userSchema.index({ otpExpiry: 1 }, { expireAfterSeconds: 0 });
userSchema.index({ passwordResetOTPExpiry: 1 }, { expireAfterSeconds: 0 });
userSchema.index({ passwordResetTokenExpiry: 1 }, { expireAfterSeconds: 0 });

// Match entered password to hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.otp;
  delete userObject.otpExpiry;
  delete userObject.passwordResetOTP;
  delete userObject.passwordResetOTPExpiry;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetTokenExpiry;
  return userObject;
};

// Update last login
userSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  return this.save();
};

// Clear all OTP and token fields
userSchema.methods.clearAllTokens = function () {
  this.otp = undefined;
  this.otpExpiry = undefined;
  this.passwordResetOTP = undefined;
  this.passwordResetOTPExpiry = undefined;
  this.passwordResetToken = undefined;
  this.passwordResetTokenExpiry = undefined;
  return this.save();
};

// Generate and set email verification OTP
userSchema.methods.generateEmailVerificationOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  this.otp = otp;
  this.otpExpiry = otpExpiry;

  return otp;
};

// Generate and set password reset OTP
userSchema.methods.generatePasswordResetOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  this.passwordResetOTP = otp;
  this.passwordResetOTPExpiry = otpExpiry;

  return otp;
};

// Generate and set password reset token
userSchema.methods.generatePasswordResetToken = function () {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  this.passwordResetToken = token;
  this.passwordResetTokenExpiry = tokenExpiry;

  return token;
};

// Verify email verification OTP
userSchema.methods.verifyEmailOTP = function (inputOTP) {
  if (!this.otp || !this.otpExpiry) {
    return { success: false, message: 'No OTP found' };
  }

  if (this.otpExpiry < new Date()) {
    return { success: false, message: 'OTP has expired' };
  }

  if (String(this.otp).trim() !== String(inputOTP).trim()) {
    return { success: false, message: 'Invalid OTP' };
  }

  return { success: true, message: 'OTP verified successfully' };
};

// Verify password reset OTP
userSchema.methods.verifyPasswordResetOTP = function (inputOTP) {
  if (!this.passwordResetOTP || !this.passwordResetOTPExpiry) {
    return { success: false, message: 'No reset OTP found' };
  }

  if (this.passwordResetOTPExpiry < new Date()) {
    return { success: false, message: 'Reset OTP has expired' };
  }

  if (String(this.passwordResetOTP).trim() !== String(inputOTP).trim()) {
    return { success: false, message: 'Invalid reset OTP' };
  }

  return { success: true, message: 'Reset OTP verified successfully' };
};

// Verify password reset token
userSchema.methods.verifyPasswordResetToken = function (inputToken) {
  if (!this.passwordResetToken || !this.passwordResetTokenExpiry) {
    return { success: false, message: 'No reset token found' };
  }

  if (this.passwordResetTokenExpiry < new Date()) {
    return { success: false, message: 'Reset token has expired' };
  }

  if (String(this.passwordResetToken).trim() !== String(inputToken).trim()) {
    return { success: false, message: 'Invalid reset token' };
  }

  return { success: true, message: 'Reset token verified successfully' };
};

// Cart helpers
userSchema.methods.addToCart = function (productId, quantity, price) {
  const existingItem = this.cart.find(
    (item) => item.product.toString() === productId.toString()
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.cart.push({ product: productId, quantity, price });
  }
  return this.save();
};

userSchema.methods.removeFromCart = function (productId) {
  this.cart = this.cart.filter(
    (item) => item.product.toString() !== productId.toString()
  );
  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = [];
  return this.save();
};

// Wishlist helpers
userSchema.methods.addToWishlist = function (productId) {
  if (!this.wishlist.includes(productId)) {
    this.wishlist.push(productId);
  }
  return this.save();
};

userSchema.methods.removeFromWishlist = function (productId) {
  this.wishlist = this.wishlist.filter(
    (id) => id.toString() !== productId.toString()
  );
  return this.save();
};

// Recently viewed helpers
userSchema.methods.addToRecentlyViewed = function (productId) {
  this.recentlyViewed = this.recentlyViewed.filter(
    (item) => item.product.toString() !== productId.toString()
  );
  this.recentlyViewed.unshift({ product: productId, viewedAt: new Date() });
  if (this.recentlyViewed.length > 20) {
    this.recentlyViewed = this.recentlyViewed.slice(0, 20);
  }
  return this.save();
};

const User = mongoose.model('User', userSchema);

export default User;