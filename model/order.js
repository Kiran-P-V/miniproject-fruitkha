const mongoose = require("mongoose");
const product = require("../model/productModel");
const Users = require("../model/userModel");
const coupon = require("../model/coupon");

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
  },
  payment: {
    type: String,
    required: true,
  },
  country: {
    type: String
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zip: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    immutable: true,
    default: () => Date.now(),
  },
  products: {
    item: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: "Product",
        },
        qty: {
          type: Number,
        },
        price: {
          type: Number,
        },
      },
    ],
    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  status: {
    type: String,
    default: "Attempted",
  },
  coupon: {
    type: mongoose.Types.ObjectId,
    ref: "Coupon",
  },
});
module.exports = mongoose.model("orders", OrderSchema);
