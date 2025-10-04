import asyncHandler from '../middleware/asyncHandler.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import mongoose from 'mongoose';
import { sendEmail, sendTemplateEmail, sendOTPEmail, sendNotificationEmail} from '../utils/sendEmail.js';


// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(process.env.PAGINATION_LIMIT) || 12;
  const page     = Number(req.query.pageNumber) || 1;

  // Build keyword filter if searching by name
  const keywordFilter = req.query.keyword
    ? {
        name: { $regex: req.query.keyword, $options: 'i' },
      }
    : {};

  // Always require that the product is approved AND has stock > 0
  const baseFilter = {
    ...keywordFilter,
    approved: true,
    countInStock: { $gt: 0 },
  };

  // Count total matching docs (for pagination)
  const count = await Product.countDocuments(baseFilter);

  // Fetch page of products, populate the artist info
  const products = await Product.find(baseFilter)
    .populate('user', 'name artistProfile')
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
  });
});


// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  // NOTE: checking for valid ObjectId to prevent CastError moved to separate
  // middleware. See README for more info.

  const product = await Product.findById(req.params.id)
   .populate('user', 'name artistProfile');
  if (product) {
    return res.json(product);
  } else {
    // NOTE: this will run if a valid ObjectId but no product was found
    // i.e. product may be null
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
const getProductsByCategory = asyncHandler(async (req, res) => {
  const pageSize = Number(process.env.PAGINATION_LIMIT) || 12;
  const page = Number(req.query.pageNumber) || 1;
  const { category } = req.params;

  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {};

  const filter = {
    category: { $regex: category, $options: 'i' },
    approved: true,
    ...keyword,
  };

  const count = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({ 
    products, 
    page, 
    pages: Math.ceil(count / pageSize),
    category 
  });
});

// @desc    Get all categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category');
  
  // Get category counts
  const categoryStats = await Product.aggregate([
    { $match: { approved: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  res.json(categoryStats.map(stat => ({
    name: stat._id,
    count: stat.count
  })));
});

// @desc    Get all brands
// @route   GET /api/products/brands
// @access  Public
const getBrands = asyncHandler(async (req, res) => {
  const brands = await Product.distinct('brand');
  
  // Get brand counts
  const brandStats = await Product.aggregate([
    { $match: { approved: true } },
    { $group: { _id: '$brand', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  res.json(brandStats.map(stat => ({
    name: stat._id,
    count: stat.count
  })));
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 6;
  
  const products = await Product.find({ isFeatured: true,  approved: true })
    .limit(limit)
    .sort({ createdAt: -1 });

  res.json(products);
});

// @desc    Get sale products
// @route   GET /api/products/sale
// @access  Public
const getSaleProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(process.env.PAGINATION_LIMIT) || 12;
  const page = Number(req.query.pageNumber) || 1;

  const filter = {
    approved: true,  
    $or: [
      { salePrice: { $exists: true, $ne: null } },
      { discount: { $gt: 0 } }
    ]
  };

  const count = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ discount: -1, salePrice: 1 });

  res.json({ 
    products, 
    page, 
    pages: Math.ceil(count / pageSize) 
  });
});

// @desc    Get new arrivals
// @route   GET /api/products/new-arrivals
// @access  Public
const getNewArrivals = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 8;
  const daysAgo = Number(req.query.days) || 30;

  const dateThreshold = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

  const products = await Product.find({
    createdAt: { $gte: dateThreshold },
    approved: true
  })
    .populate('user', 'name artistProfile') // ✅ populate here
    .limit(limit)
    .sort({ createdAt: -1 });

  res.json(products);
});


// @desc    Get best sellers
// @route   GET /api/products/best-sellers
// @access  Public
const getBestSellers = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 8;
  
  const products = await Product.find({approved: true,  })
    .sort({ numReviews: -1, rating: -1 })
    .limit(limit);

  res.json(products);
});

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ approved: true })
    .sort({ rating: -1 })
    .limit(3)
    .populate('user', 'name artistProfile');

  res.json(products);
});

// @desc    Get recommended products
// @route   GET /api/products/recommended/:id
// @access  Public
const getRecommendedProducts = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const limit = Number(req.query.limit) || 4;
  
  // Find products in same category, excluding current product
  const recommendedProducts = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
    approved: true
  })
    .sort({ rating: -1, numReviews: -1 })
    .limit(limit);

  // If not enough products in same category, fill with top-rated products
  if (recommendedProducts.length < limit) {
    const additional = await Product.find({
      _id: { 
        $nin: [product._id, ...recommendedProducts.map(p => p._id)] 
      }
    })
      .sort({ rating: -1 })
      .limit(limit - recommendedProducts.length);
    
    recommendedProducts.push(...additional);
  }

  res.json(recommendedProducts);
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
// @desc    Create a product
// @route   POST /api/products
// @access  Private (Seller only, not admin)
const createProduct = asyncHandler(async (req, res) => {


  // 1️⃣ Ensure user is an approved seller
  const user = await User.findById(req.user._id);
  if (!user || !user.isSeller || !user.sellerApproved) {
    return res.status(403).json({ message: 'You are not an approved seller' });
  }

  // 2️⃣ Normalize payload for multipart vs JSON
  let productData = req.body;
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    if (typeof productData.images === 'string') productData.images = JSON.parse(productData.images);
    if (typeof productData.tags   === 'string') productData.tags   = JSON.parse(productData.tags);
  }

  // 3️⃣ Destructure + validate
  const {
    name,
    price,
    description,
    image,                 // main image URL
    images = [],           // array of other URLs
    category,
    medium,
    framed,
    style,
    type,
    brand = '',
    countInStock = 0,
    tags = [],
    specifications = [],
    weight = null,
    dimensions = {},       // e.g. { length: 10, width: 8, height: 1 }
    sku = '',
    metaTitle = '',
    metaDescription = '',
    salePrice = null,
    isFeaturedCollection = false,
  } = productData

  if (!name || price == null || !description || !image || !category) {
    return res.status(400).json({
      message: 'Missing required fields: name, price, description, image, category',
    });
  }

  // 4️⃣ Build & save
  const product = new Product({
    user: req.user._id,
    name,
    price,
    description,
    image,
    images,
    category,
    medium,
    style,
    framed,
    type,
    brand,
    countInStock,
    tags,
    specifications,
    weight,
    dimensionLength: dimensions.length ?? null,
    dimensionWidth:  dimensions.width  ?? null,
    dimensionHeight: dimensions.height ?? null,
   
    metaTitle,
    metaDescription,
    salePrice,
    isFeaturedCollection,
    approved: false,    // starts off pending
  })
  const createdProduct = await product.save();

  // 5️⃣ Notify all admins
  const admins = await User.find({ isAdmin: true }).select('email name');
  await Promise.all(
    admins.map(admin =>
      sendNotificationEmail({
        to: admin.email,
        type: 'newProductUploaded',
        orderData: {
          adminName:    admin.name,
          sellerName:   user.name,
          sellerEmail:  user.email,
          productName:  createdProduct.name,
          productId:    createdProduct._id.toString(),
        }
      }).catch(err => console.error(`❌ Admin ${admin.email} email failed:`, err.message))
    )
  );

  // 6️⃣ Notify the seller
  await sendNotificationEmail({
    to: user.email,
    type: 'productSubmissionReceived',
    orderData: {
      name:        user.name,
      productName: createdProduct.name,
      productId:   createdProduct._id.toString(),
    }
  }).catch(err => console.error(`❌ Seller ${user.email} email failed:`, err.message));

  // 7️⃣ Respond
  res.status(201).json({
    message: 'Product created successfully. Pending admin approval.',
    product: createdProduct,
  });
});




// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    description,
    image,
    images,
    brand,
    category,
    countInStock,
    tags,
    framed,
    specifications,
    weight,
    dimensions,
    sku,
    metaTitle,
    metaDescription,
    isFeatured,
    isOnSale,
    salePrice,
    isFeaturedCollection,
        medium,
style,
type,
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // ✅ Check ownership: only admin or product owner can edit
  if (!req.user.isAdmin && product.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to edit this product');
  }

  // ✅ Update basic fields
  if (name !== undefined) product.name = name;
  if (price !== undefined) product.price = price;
  if (description !== undefined) product.description = description;
  if (image !== undefined) product.image = image;
  if (images !== undefined) product.images = images;
  if (brand !== undefined) product.brand = brand;
  if (category !== undefined) product.category = category;
  if (countInStock !== undefined) product.countInStock = countInStock;

  // ✅ Update optional fields
  if (tags !== undefined) product.tags = tags;
  if (specifications !== undefined) product.specifications = specifications;
  if (weight !== undefined) product.weight = weight;
  if (dimensions !== undefined) product.dimensions = dimensions;
  if (sku !== undefined) product.sku = sku;
  if (metaTitle !== undefined) product.metaTitle = metaTitle;
  if (metaDescription !== undefined) product.metaDescription = metaDescription;
  if (isFeatured !== undefined) product.isFeatured = isFeatured;
  if (isOnSale !== undefined) product.isOnSale = isOnSale;
  if (salePrice !== undefined) product.salePrice = salePrice;
  if (isFeaturedCollection !== undefined) product.isFeaturedCollection = isFeaturedCollection;

  // ✅ If a non-admin seller edits, reset approval
  if (!req.user.isAdmin) {
    product.approved = false;
  }

  const updatedProduct = await product.save();

  res.json({
    message: req.user.isAdmin
      ? 'Product updated successfully'
      : 'Product updated. Pending admin approval again.',
    product: updatedProduct,
  });
});

export const updateProductDiscount = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { discountPercent } = req.body ?? {};
  const value = Number(discountPercent);

  if (!mongoose.isValidObjectId(id)) {
    res.status(400);
    throw new Error('Invalid product id');
  }
  if (!Number.isFinite(value) || value < 0 || value > 90) {
    res.status(400);
    throw new Error('Discount must be a number between 0 and 90');
  }

  const product = await Product.findById(id).select(
    'user price originalPrice discountPercent'
  );
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const isOwner = String(product.user) === String(req.user._id);
  const isAdmin = !!req.user?.isAdmin;
  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to modify this product');
  }

  if (value > 0) {
    if (product.originalPrice == null) product.originalPrice = product.price;
    const base = Number(product.originalPrice ?? product.price);
    product.price = Math.max(0, Math.round(base * (1 - value / 100)));
    product.discountPercent = Math.round(value);
  } else {
    if (product.originalPrice != null) product.price = product.originalPrice;
    product.originalPrice = null;
    product.discountPercent = 0;
  }

  await product.save();

  res.json({
    message: 'Discount updated',
    productId: product._id,
    price: product.price,
    originalPrice: product.originalPrice,
    discountPercent: product.discountPercent,
  });
});


// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await Product.deleteOne({ _id: product._id });
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Toggle featured status of a product
// @route   PUT /api/products/:id/featured
// @access  Private/Admin
// @desc    Toggle product's featured status
// @route   PUT /api/products/:id/toggle-featured
// @access  Private/Admin
const toggleFeaturedProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('user', 'name artistProfile');

  if (product) {
    product.isFeatured = !product.isFeatured;
    const updatedProduct = await product.save();
    const populatedProduct = await Product.findById(updatedProduct._id).populate(
      'user',
      'name artistProfile'
    );

    res.json({
     message: `Product "${populatedProduct.name}" is now ${populatedProduct.isFeatured ? 'featured' : 'unfeatured'} successfully`,
      product: populatedProduct,
      artist: populatedProduct.user,
    });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});



// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Get product statistics
// @route   GET /api/products/stats
// @access  Private/Admin
const getProductStats = asyncHandler(async (req, res) => {
  const totalProducts = await Product.countDocuments();
  const inStockProducts = await Product.countDocuments({ countInStock: { $gt: 0 } });
  const outOfStockProducts = await Product.countDocuments({ countInStock: { $lte: 0 } });
  const featuredProducts = await Product.countDocuments({ isFeatured: true });

  // Get average rating
  const ratingStats = await Product.aggregate([
    { $group: { _id: null, avgRating: { $avg: '$rating' } } }
  ]);
  const averageRating = ratingStats.length > 0 ? ratingStats[0].avgRating : 0;

  // Get category distribution
  const categoryStats = await Product.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Get brand distribution
  const brandStats = await Product.aggregate([
    { $group: { _id: '$brand', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Get price range stats
  const priceStats = await Product.aggregate([
    {
      $group: {
        _id: null,
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        avgPrice: { $avg: '$price' }
      }
    }
  ]);

  // Get recent products (last 30 days)
  const recentProducts = await Product.countDocuments({
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  });

  res.json({
    totalProducts,
    inStockProducts,
    outOfStockProducts,
    featuredProducts,
    recentProducts,
    averageRating: averageRating || 0,
    priceRange: priceStats.length > 0 ? priceStats[0] : { minPrice: 0, maxPrice: 0, avgPrice: 0 },
    categoryDistribution: categoryStats,
    brandDistribution: brandStats
  });
});
// @desc    Get products by brand
// @route   GET /api/products/brand/:brand
// @access  Public
const getProductsByBrand = asyncHandler(async (req, res) => {
  const pageSize = Number(process.env.PAGINATION_LIMIT) || 12;
  const page = Number(req.query.pageNumber) || 1;
  const { brand } = req.params;

  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {};

  const filter = {
    brand: { $regex: brand, $options: 'i' },
    approved: true,
    ...keyword,
    
  };

  const count = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    brand,
  });
});
const searchProducts = asyncHandler(async (req, res) => {
  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i', // case-insensitive
        },
      }
    : {};

  const products = await Product.find(keyword).select('name image price');

  res.json(products);
});

// @desc    Approve product
// @route   PUT /api/products/:id/approve
// @access  Private/Admin

const approveProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  product.approved = true;
  await product.save();

  // 🎉 Notify only the seller
  const seller = await User.findById(product.user).select('email name');
  if (seller?.email) {
    try {
      await sendNotificationEmail({
        to: seller.email,
        type: 'productApproved',        // new template key
        orderData: {
          sellerName:  seller.name,
          productName: product.name,
          productId:   product._id.toString(),
        },
      });
      console.log(`✅ Approval email sent to seller ${seller.email}`);
    } catch (err) {
      console.error(`❌ Failed to send approval email to ${seller.email}:`, err.message);
    }
  }

  res.json({ message: 'Product approved successfully', product });
});

// PUT /api/products/:id/feature-collection
// Private/Admin
const toggleFeaturedCollection = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  product.isFeaturedCollection = !product.isFeaturedCollection;
  await product.save();

  res.json({
    message: `Collection is now ${product.isFeaturedCollection ? 'featured' : 'not featured'}`,
    product,
  });
});


// GET /api/products/featured-collections
// Public
const getFeaturedCollections = asyncHandler(async (req, res) => {
  const products = await Product.find({ approved: true, isFeaturedCollection: true });
  res.json(products);
});

// GET /api/products/artist/:artistId
// GET /api/products/artist/:artistId
const getProductsByArtist = asyncHandler(async (req, res) => {
  const { artistId } = req.params;

  if (!mongoose.isValidObjectId(artistId)) {
    res.status(400);
    throw new Error('Invalid artist id');
  }

  // IMPORTANT: include originalPrice + discountPercent in select
  const products = await Product.find({ user: artistId })
    .select('name image price originalPrice discountPercent user')
    .populate('user', 'name artistProfile')
    .sort({ createdAt: -1 })
    .lean();

  res.json(products);
});


// @desc    Get unapproved products
// @route   GET /api/products/unapproved
// @access  Private/Admin
const getUnapprovedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ approved: false }).populate('user', 'name artistProfile');
  res.json(products);
});

const declineProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // 1️⃣ Fetch seller
  const seller = await User.findById(product.user).select('email name');
  if (seller?.email) {
    try {
      await sendNotificationEmail({
        to: seller.email,
        type: 'productDeclined',       // new template key
        orderData: {
          sellerName:  seller.name,
          productName: product.name,
          productId:   product._id.toString(),
        },
      });
      console.log(`✅ Decline email sent to seller ${seller.email}`);
    } catch (err) {
      console.error(`❌ Failed to send decline email to ${seller.email}:`, err.message);
    }
  }

  // 2️⃣ Remove the product
  await product.deleteOne();

  res.json({ message: 'Product request declined and removed' });
});












export {
  getProducts,
  getProductById,
  getProductsByCategory,
  getCategories,
  getProductsByBrand,
  getBrands,
  getFeaturedProducts,
  getSaleProducts,
  getNewArrivals,
  getBestSellers,
  getTopProducts,
  getRecommendedProducts,
  deleteProduct,
  createProduct,
  declineProduct,
  updateProduct,
  toggleFeaturedProduct,
  createProductReview,
  getProductStats,
  searchProducts,
  approveProduct,
  toggleFeaturedCollection,
  getFeaturedCollections,
  getProductsByArtist,
  getUnapprovedProducts,
};