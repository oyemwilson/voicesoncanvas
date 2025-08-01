import mongoose from 'mongoose';

// ✅ Simple schema definitions without potential conflicts
const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  { timestamps: true }
);

const variationSchema = mongoose.Schema({
  size: {
    type: String,
    enum: ['A4', 'A3', 'A2', 'A1']
  },
  framed: { type: Boolean, default: false },
  price: { type: Number },
  stock: { type: Number, default: 0 },
  sku: { type: String },
  image: { type: String },
});

const specificationSchema = mongoose.Schema({
  key: { type: String, required: true },
  value: { type: String, required: true },
});

const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },

    // Core fields
    name: { type: String, required: true },
    description: { type: String, required: true },

    // Category/collection fields
    category: {
      type: String,
      enum: [
        "Abstract",
        "Realism",
        "Afro-Futurism",
        "Contemporary",
        "Traditional",
        'Other'
      ],
      default: 'Other',
    },
    collection: { type: String },

    // Media
    image: { type: String, required: true },
    images: [String],

    // Art-specific fields
    type: {
      type: String,
  enum: [
    'Original Artwork',
    'Limited Edition Print',
    'Open Edition Print',
    'Digital Download',
    'Sculpture',
    'Mixed-Media','Abstract', 'Realism', 'Afro-Futurism', 'Other'
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
    'Photography','Painting', 'Print', 'Sculpture', 'Mixed Media'
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
        'Other','Original', 'Mixed-Media', 'Print', 'Sculpture'
      ],
      default: 'Other',
    },

    // Framed and edition info
    framed: { type: Boolean, default: false },
    isLimitedEdition: { type: Boolean, default: false },
    editionSize: { type: Number },

    // Dimensions as separate fields (avoiding nested objects)
    dimensionLength: { type: Number },
    dimensionWidth: { type: Number },
    dimensionHeight: { type: Number },
    weight: { type: Number },



    // Pricing
    price: { type: Number, required: true, default: 0 },
    currency: {
      type: String,
      enum: ['NGN', 'USD', 'EUR', 'GBP'],
      default: 'NGN'
    },
    countInStock: { type: Number, required: true, default: 1 },

    // Variations array
    variations: [variationSchema],

    // Reviews
    reviews: [reviewSchema],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },

    // Status fields
    approved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isFeaturedCollection: { type: Boolean, default: false },

    // Additional fields
    artistName: { type: String },
    tags: [String],
    sku: { type: String },
    specifications: [specificationSchema],
    metaTitle: { type: String },
    metaDescription: { type: String },
  },
  {
    timestamps: true
  }
);

// Add indexes
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ medium: 1 });
productSchema.index({ style: 1 });
productSchema.index({ price: 1 });
productSchema.index({ approved: 1 });
productSchema.index({ user: 1 });

// ✅ Check if model already exists to avoid re-compilation
let Product;
try {
  Product = mongoose.model('Product');
} catch (error) {
  Product = mongoose.model('Product', productSchema);
}

export default Product;