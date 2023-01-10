const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: false,
    // match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g, 'Invalid product'],
  },
  price: { type: Number, required: true },
  thumbnail: { type: String },
});

ProductSchema.index({ email: 1 });

module.exports = ProductSchema;
