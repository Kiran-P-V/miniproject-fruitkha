const bcrypt = require("bcrypt");

const User = require("../model/userModel");
const product = require("../model/productModel");
const { find } = require("../model/userModel");
const category = require("../model/category");
const banner = require("../model/banner");
const session = require("express-session");
const coupon = require("../model/coupon");
const Orders = require("../model/order");
const order = require("../model/order");
const { findById } = require("../model/productModel");
const fast2sms = require("fast-two-sms");
const Razorpay = require("razorpay");
const cors = require("cors");
const flash = require("connect-flash");

// const session=require('../model/session')

// eslint-disable-next-line consistent-return
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const loadRegister = async (req, res) => {
  try {
    res.render("register.ejs");
  } catch (error) {
    console.log(error.message);
  }
};

// inserting user on register form

const insertuser = async (req, res) => {
  if (req.body.password === req.body.password2) {
    try {
      const spassword = await securePassword(req.body.password);
      console.log(req.body);

      const user = new User({
        name: req.body.name,
        email: req.body.email,
        tel: req.body.tel,
        password: spassword,
        is_admin: 0,
      });

      const userData = await user.save();
      newUser = userData._id;

      if (userData) {
        res.redirect("/verifyOtp");
      } else {
        return res.render("register.ejs", {
          message: "Your registration has been failed",
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  } else {
    return res.render("register.ejs", {
      message: " Password must be same",
    });
  }
};

let newUser;
let newOtp;

const sendMessage = function (mobile, res) {
  let randomOTP = Math.floor(Math.random() * 10000);
  var options = {
    authorization:
      "MSOj0bTnaP8phCARmWqtzkgEV4ZN2Ff9eUxXI7iJQ5HcDBKsL1vYiamnRcMxrsjDJboyFEXl0Sk37pZq",
    message: `your OTP verification code is ${randomOTP}`,
    numbers: [mobile],
  };
  //send this message
  fast2sms
    .sendMessage(options)
    .then((response) => {
      console.log("otp sent successfully");
    })
    .catch((error) => {
      console.log(error);
    });
  return randomOTP;
};

const loadOtp = async (req, res) => {
  try {
    const userData = await User.findById({ _id: newUser });
    const otp = sendMessage(userData.tel, res);
    newOtp = otp;
    console.log("otp:", otp);
    res.render("otpVerify", { otp: otp, user: newUser });
  } catch (error) {
    console.log(error.message);
  }
};
const verifyOtp = async (req, res) => {
  try {
    const otp = newOtp;
    const userData = await User.findById({ _id: req.body.user });
    if (otp == req.body.otp) {
      userData.isVerified = 1;
      const user = await userData.save();
      if (user) {
        res.redirect("/login");
      }
    } else {
      res.render("otpVerify", { message: "Invalid OTP" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loginuser = async (req, res) => {
  try {
    if (req.body.user_id) {
      res.redirect("/");
    } else {
      res.render("login.ejs");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const verifylogin = async (req, res) => {
  try {
    const { email } = req.body;
    const { password } = req.body;
    const userData = await User.findOne({ email });
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (userData.isVerified) {
          req.session.userid = userData._id;
          res.redirect("/");
        } else {
          res.render("login.ejs", {
            message: "You are blocked by admin",
          });
        }
      } else {
        res.render("login.ejs", {
          message: "password is incorrect",
        });
      }
    } else {
      res.render("login.ejs", {
        message: "Email incorrect",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const loadHome = async (req, res) => {
  try {
    const id = req.user_id;
    const productData = await product.find({ bestseller: 1 });
    const userData = await User.findOne({ _id: id });
    const bannerData = await banner.findOne({ active: 1 });
    return res.render("home.ejs", {
      path: "/",
      users: userData,
      bannerData,
      product: productData,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const loadabout = async (req, res) => {
  try {
    res.render("about", { path: "/about" });
  } catch (error) {
    console.log(error.message);
  }
};

const userDetails = async (req, res) => {
  try {
    const { email, tel, country, address, city, state, zip } = req.body;
    await User.findByIdAndUpdate(
      { _id: req.session.userid },
      { $set: { email, tel, country, address, city, state, zip } }
    );
    res.redirect("/login");
  } catch (error) {
    console.log(error.message);
  }
};

const loadcontact = async (req, res) => {
  try {
    res.render("contact", { path: "/contact" });
  } catch (error) {
    console.log(error.message);
  }
};

const getSearch = async (req, res) => {
  try {
    let products = req.body.products.trim();
    let search = await product
      .find({ product: { $regex: new RegExp("^" + products + ".*", "i") } })
      .exec();
    search = search.slice(0, 4);
    res.send({ products: search });
  } catch (error) {
    console.log(error.message);
  }
};

const loadshop = async (req, res) => {
  try {
    const productData = await product.find();
    const categoryData = await category.find();
    res.render("shop", {
      path: "/shop",
      products: productData,
      category: categoryData,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const loadsingleproduct = async (req, res) => {
  try {
    const productId = req.query.id;
    const productData = await product.findById({ _id: productId });
    res.render("singleproduct", {
      path: "/singleproduct",
      product: productData,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const profile = async (req, res) => {
  try {
    const userid = req.session.userid;
    const userData = await User.findById({ _id: userid });
    res.render("profile", { path: "/profile", user: userData });
  } catch (error) {
    console.log(error.message);
  }
};

const logout = async (req, res) => {
  try {
    req.session.userid = null;
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

const loadCart = async (req, res) => {
  try {
    if (req.session.userid) {
      const userData = await User.findById({ _id: req.session.userid });
      const pop = await userData.populate("cart.item.productId");
      const totalPrice = pop.cart.totalPrice;
      res.render("cart", {
        path: "/cart",
        cartProducts: pop.cart,
        totalPrice: totalPrice,
        message: req.flash("message"),
        userDatas: userData,
      });
    } else {
      res.render("/login");
    }
  } catch (error) {
    console.log(error);
  }
};

const addToCart = async (req, res) => {
  try {
    const productId = req.query.id;
    const userid = req.session.userid;

    const userData = await User.findById({ _id: userid });
    const productData = await product.findById({ _id: productId });
    const add = await userData.addToCart(productData);
    res.redirect("/cart");
    if (add) {
      userData.removeFromWishlist(productId);
      res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const deleteCart = async (req, res) => {
  try {
    const procuctId = req.query.id;
    const userData = await User.findById({ _id: req.session.userid });
    userData.removefromCart(procuctId);
    setTimeout(() => {
      res.redirect("/cart");
    }, 500);
  } catch (error) {
    console.log(error.message);
  }
};

const editqty = async (req, res) => {
  try {
    const id = req.query.id;

    const userData = await User.findById({ _id: req.session.userid });

    const foundProduct = userData.cart.item.findIndex((x) => x.productId == id);

    const qty = { a: parseInt(req.body.qty) };
    userData.cart.item[foundProduct].qty = qty.a;
    const price = userData.cart.item[foundProduct].price;
    userData.cart.totalPrice = 0;
    const totalPrice = userData.cart.item.reduce((acc, curr) => {
      return acc + curr.price * curr.qty;
    }, 0);
    userData.cart.totalPrice = totalPrice;
    await userData.save();

    res.json({ totalPrice, price });
  } catch (error) {
    console.log(error.message);
  }
};

const checkCoupon = async (req, res) => {
  try {
    const couponData = await coupon.find({ status: 1 });
    const userId = req.session.userid;
    const userData = await User.findById({ _id: userId });
    const reqCoup = req.body.coupon;
    if (couponData[0].status == 1) {
      const totalPrice = userData.cart.totalPrice;
      const minBill = couponData[0].minbill;
      if (totalPrice >= minBill) {
        if (couponData[0].code === reqCoup) {
          const couponValue = couponData[0].value;
          const finalAmount = userData.cart.totalPrice - couponValue;

          await User.findByIdAndUpdate(
            { _id: userId },
            { $set: { "cart.totalPrice": finalAmount } }
          );
          await coupon.updateOne({ status: 1 }, { $set: { status: 0 } });
          res.redirect("/checkout");
          req.flash("message", "coupon applied");
        } else {
          res.redirect("/checkout");
          req.flash("message", "Coupon invalid");
        }
      } else {
        res.redirect("/checkout");
        req.flash(
          "message",
          "You need to purchase minimum Rs.500 to apply the coupon"
        );
      }
    } else {
      res.redirect("/checkout");
      req.flash("message", "Coupon already used");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadWishlist = async (req, res) => {
  try {
    if (req.session.userid) {
      const userData = await User.findById({ _id: req.session.userid });
      const populatedData = await userData.populate("wishlist.item.productId");
      console.log(populatedData);
      res.render("wishlist", {
        path: "/wishlist",
        wishlist: populatedData.wishlist,
      });
      res.redirect("/login");
    } else {
    }
  } catch (error) {
    console.log(error.message);
  }
};

const addToWishlist = async (req, res) => {
  try {
    const userData = await User.findById({ _id: req.session.userid });

    const add = await userData.addToWishlist(req.query.id);
    if (add) {
      userData.removefromCart(req.query.id);
      res.redirect("/wishlist");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const deleteWishlist = async (req, res) => {
  try {
    const userData = await User.findById({ _id: req.session.userid });
    userData.removeFromWishlist(req.query.id);
    setTimeout(() => {
      res.redirect("/wishlist");
    }, 1000);
  } catch (error) {
    console.log(error.message);
  }
};

let afterPrice = 0;
let isApplied = 0;

const loadcheckout = async (req, res) => {
  try {
    const userData = await User.findById({ _id: req.session.userid });
    const pop = await userData.populate("cart.item.productId");
    if (pop.cart.item.length > 0) {
      const date = new Date()
        .toJSON()
        .slice(0, 10)
        .split("-")
        .reverse()
        .join("/");
      const coupons = await coupon.findOne({ isUsed: 0 });
      const totalPrice = pop.cart.totalPrice;
      res.render("checkout", {
        path: "/checkout",
        cartProduct: pop.cart,
        coupons,
        afterPrice,
        isApplied,
        totalPrice: totalPrice,
        user: pop,
      });
    } else {
      res.redirect("/cart");
      req.flash("message", "Cart is empty");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const createOrder = async (req, res) => {
  try {
    const userData = await User.findById({ _id: req.session.userid });
    // await coupon.updateOne({value:req.body.value},{$push:{coustomer:req.session.userid}})

    const populatedData = await userData.populate("cart.item.productId");

    let order;
    if (req.body.currentAddress) {
      const { _id, country, address, city, state, zip, phonenumber, email } =
        userData;
      order = new Orders({
        userId: _id,
        name: userData.name,
        country,
        address,
        city,
        state,
        zip,
        phone: phonenumber,
        email,
        products: populatedData.cart,
        payment: req.body.payment,
      });
    } else {
      const {
        name,
        country,
        address,
        city,
        state,
        zip,
        phone,
        email,
        payment,
      } = req.body;
      order = new Orders({
        userId: req.session.userid,
        name,
        country,
        address,
        city,
        state,
        zip,
        phone,
        email,

        products: populatedData.cart,
        payment,
      });
    }
    if (!req.body.payment) {
      req.flash("message", "Please select on of the payment modes");
      return res.redirect("/checkout");
    }
    const orderData = await order.save();

    if (orderData) {
      await User.updateOne({ _id: req.session.userid }, { cart: {} });
      afterPrice = 0;
      isApplied = 0;

      if (req.body.payment === "Cash on delivery") {
        return res.redirect("/orderSuccess");
      } else if (req.body.payment === "Razorpay") {
        return res.redirect("/razorpay");
      } else if (req.body.payment === "Paypal") {
        return res.redirect("/");
      } else {
        res.redirect("/checkout");
      }
    } else {
      res.redirect("/checkout");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const loadRazorpay = async (req, res) => {
  try {
    console.log("razorpay loading");
    res.render("razorpay");
  } catch (error) {
    console.log(error.message);
  }
};
// ..................
const razorpayCheckout = async (req, res) => {
  try {
    const userData = await User.findById({ _id: req.session.userid });
    const completeUser = await userData.populate("cart.item.productId");
    let instance = new Razorpay({
      key_id: "rzp_test_6ECQ3wFYlifQi2",
      key_secret: "akkbAG21AjGFcIfvmYditBnf",
    });

    let order = await instance.orders.create({
      amount: 20000000,
      currency: "INR",
      receipt: "receipt#1",
    });
    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    console.log(error.message);
  }
};
const orderSuccess = async (req, res) => {
  try {
    const productData = await product.find({ bestseller: 1 });
    res.render("orderSuccess", { path: "/orderSuccess", product: productData });
  } catch (error) {
    console.log(error.message);
  }
};

const myOrders = async (req, res) => {
  try {
    const userId = req.session.userid;
    const userData = await User.findById({ _id: userId });
    const orderData = await order.find({ userId: userId });
    res.render("myOrder", {
      path: "/myOrders",
      orderDatas: orderData,
      orderDatas: orderData,
      userDatas: userData,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const cancelOrder = async (req, res) => {
  try {
    const id = req.query.id;
    await order.findByIdAndUpdate({ _id: id }, { $set: { status: "cancel" } });
    res.redirect("/myorders");
  } catch (error) {
    console.log(error.message);
  }
};

const viewOrder = async (req, res) => {
  try {
    const orderId = req.query.id;
    const orderData = await order.findById({ _id: orderId });
    const pop = await orderData.populate("products.item.productId");
    res.render("viewOrder", { path: "/viewOrder", productpop: pop.products });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  insertuser,
  loadRegister,
  loginuser,
  verifylogin,
  loadHome,
  loadabout,
  loadcontact,
  loadcheckout,
  loadshop,
  loadsingleproduct,
  addToCart,
  profile,
  logout,
  getSearch,
  loadCart,
  deleteCart,
  loadWishlist,
  addToWishlist,
  deleteWishlist,
  checkCoupon,
  createOrder,
  userDetails,
  orderSuccess,
  myOrders,
  cancelOrder,
  viewOrder,
  verifyOtp,
  loadOtp,
  loadRazorpay,
  razorpayCheckout,
  editqty,
};
