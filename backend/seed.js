const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

const products = [
  { id: 1, name: "Minimalist Black Hoodie", price: 65, image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2" },
  { id: 2, name: "Classic White Tee", price: 30, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518" },
  { id: 3, name: "Oversized Denim Jacket", price: 110, image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0" },
  { id: 4, name: "Slim-Fit Chino Pants", price: 75, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80" }
];

mongoose.connect(process.env.MONGO_URI)
.then(async () => {
    console.log('MongoDB Connected for Seeding');
    await Product.deleteMany({});
    console.log('Old products removed');
    await Product.insertMany(products);
    console.log('Sample products seeded');
    mongoose.connection.close();
})
.catch(err => console.log(err));
