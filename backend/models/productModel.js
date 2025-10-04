// models/productModel.js
import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  },
  { timestamps: true }
);

// Individual variation (optional per-variation discounts)
const variationSchema = new mongoose.Schema({
  size: { type: String, enum: ['A4', 'A3', 'A2', 'A1'] },
  framed: { type: Boolean, default: false },
  price: { type: Number },
  // Per-variation discount (optional; you can ignore these in your current UI)
  originalPrice: { type: Number, default: null },
  discountPercent: { type: Number, default: 0, min: 0, max: 90 },

  stock: { type: Number, default: 0 },
  sku: { type: String },
  image: { type: String },
});

const specificationSchema = new mongoose.Schema({
  key: { type: String, required: true },
  value: { type: String, required: true },
});

const productSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },

    // Core fields
    name: { type: String, required: true },
    description: { type: String, required: true },

    // Category/collection
    category: {
      type: String,
      enum: [
        'Abstract',
        'Realism',
        'Afro-Futurism',
        'Contemporary',
        'Traditional',
        'Other',
      ],
      default: 'Other',
    },
    collectionName: { type: String },

    // Media
    image: { type: String, required: true },
    images: [String],

    // Art-specific fields
    type: {
      type: String,
      enum: [
        'Original',
        'Original Artwork',
        'Limited Edition Print',
        'Open Edition Print',
        'Digital Download',
        'Sculpture',
        'Mixed-Media',
        'Print',
        'Photography',
        'Other',
      ],
    },
    medium: {
      type: String,
      enum: [
        'Oil Painting',
        'Acrylic Painting',
        'Watercolor',
        'Digital Print',
        'Canvas Print',
        'Sculpture',
        'Mixed Media',
        'Photography',
        'Painting',
        'Print',
      ],
      required: true,
    },
    style: {
      type: String,
      enum: [
        'Abstract',
        'Realism',
        'Impressionism',
        'Minimalism',
        'Afro-Futurism',
        'Pop Art',
        'Surrealism',
        'Other',
      ],
      default: 'Other',
    },

    // Framed and edition info
    framed: { type: Boolean, default: false },
    isLimitedEdition: { type: Boolean, default: false },
    editionSize: { type: Number },

    // Dimensions
    dimensionLength: { type: Number },
    dimensionWidth: { type: Number },
    dimensionHeight: { type: Number },
    weight: { type: Number },

    // Pricing (root-level)
    price: { type: Number, required: true, default: 0 }, // ACTIVE price (may be discounted)
    originalPrice: { type: Number, default: null },      // Base price when discount active
    discountPercent: { type: Number, default: 0, min: 0, max: 90 }, // 0 = no discount

    currency: {
      type: String,
      enum: ['NGN', 'USD', 'EUR', 'GBP'],
      default: 'NGN',
    },

    countInStock: { type: Number, required: true, default: 1 },

    // Variations
    variations: [variationSchema],

    // Reviews
    reviews: [reviewSchema],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },

    // Status
    approved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isFeaturedCollection: { type: Boolean, default: false },

    // Additional
    artistName: { type: String },
    tags: [String],
    sku: { type: String },
    specifications: [specificationSchema],
    metaTitle: { type: String },
    metaDescription: { type: String },
  },
  { timestamps: true }
);

// Indexes
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ medium: 1 });
productSchema.index({ style: 1 });
productSchema.index({ price: 1 });
productSchema.index({ approved: 1 });
productSchema.index({ user: 1 });

// Safe export without recompilation errors in dev
export default mongoose.models.Product || mongoose.model('Product', productSchema);
