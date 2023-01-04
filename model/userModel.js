const mongoose = require("mongoose");
const Product = require(".././model/productModel");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    lowercase: true,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    lowercase: true,
    required: [true, "can't be blank"],
    match: [/\S+@\S+\.\S+/, "is invalid"],
    index: true,
  },
  tel: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  password2: {
    type: String,
  },
  is_admin: {
    type: Number,
    required: true,
  },
  isVerified: {
    type: Number,
    default: 1,
  },
address:{
  type:String,
  
},
city:{
  type:String,
  
}, state:{
  type:String,
  
},
zip:{
  type:String,

},
  cart: {
    item: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        qty: {
          type: Number,
          required: true,
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
  wishlist: {
    item: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: "Product",
          required: true,
        },
      },
    ],
  },
});

userSchema.methods.addToCart = function (product) {
  const cart = this.cart;
  const isExisting = cart.item.findIndex((objInItems) => {
    return (
      new String(objInItems.productId).trim() == new String(product._id).trim()
    );
  });
  if (isExisting >= 0) {
    cart.item[isExisting].qty += 1;
  } else {
    cart.item.push({ productId: product._id, qty: 1, price: product.productprize});
  }
  cart.totalPrice += product.productprize;
  return this.save();
};

userSchema.methods.removefromCart = async function (productId) {
  const cart = this.cart;
  const isExisting = cart.item.findIndex(
    (objInItems) =>
      new String(objInItems.productId).trim() === new String(productId).trim()
  );
  if (isExisting >= 0) {
    const prod = await Product.findById(productId);
    cart.totalPrice = cart.totalPrice - prod.productprize * cart.item[isExisting].qty;
    cart.item.splice(isExisting, 1);
    return this.save();
  }
};
userSchema.methods.addToWishlist = function (productid) {
  const wishlist = this.wishlist;
  const isExisting = wishlist.item.findIndex(
    (objInItems) =>
      new String(objInItems.productId).trim() === new String(productid).trim()
  );
  if (isExisting < 0) {
    wishlist.item.push({ productId: productid });
  } 
  return this.save();
};

userSchema.methods.removeFromWishlist = async function (productid) {
  const wishlist = this.wishlist;
  const isExisting = wishlist.item.findIndex(
    (objInItems) =>
      new String(objInItems.productId).trim() === new String(productid).trim()
  );
  if (isExisting >= 0) {
    wishlist.item.splice(isExisting, 1);

    return this.save();
  }
};

module.exports = mongoose.model("user", userSchema);
