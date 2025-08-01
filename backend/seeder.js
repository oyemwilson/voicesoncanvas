import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import users from './data/users.js';
import products from './data/products.js';
import User from './models/userModel.js';
import Product from './models/productModel.js';
import Order from './models/orderModel.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const importData = async () => {
  try {
    // Clear previous data
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    // Insert users
    const createdUsers = await User.insertMany(users);

    // Grab first 3 users
    const artistUsers = createdUsers.slice(1, 3);


    // Prepare buckets for each user
    const worksMap = artistUsers.map(() => []); // an array of arrays

    // Distribute products in a round-robin way
    const sampleProducts = products.map((product, index) => {
      const assignedUserIndex = index % artistUsers.length;
      const assignedUser = artistUsers[assignedUserIndex];
      worksMap[assignedUserIndex].push(product.name); // for reference
      return { ...product, user: assignedUser._id };
    });

    // Insert products
    const createdProducts = await Product.insertMany(sampleProducts);

    // Update each user's artistProfile.availableWorks
    // Build a map of userId -> productIds
    const userProductsMap = {};
    createdProducts.forEach((p, idx) => {
      const uIndex = idx % artistUsers.length;
      const uId = artistUsers[uIndex]._id.toString();
      if (!userProductsMap[uId]) userProductsMap[uId] = [];
      userProductsMap[uId].push(p._id);
    });

    // Save artistProfile.availableWorks for each artist
    for (const user of artistUsers) {
      user.artistProfile = user.artistProfile || {};
      user.artistProfile.availableWorks = userProductsMap[user._id.toString()] || [];
      await user.save();
    }

    console.log('✅ Data Imported & products spread across first 3 users!'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log('🗑️ Data Destroyed!'.red.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
