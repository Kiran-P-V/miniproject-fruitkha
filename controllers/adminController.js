const User = require("../model/userModel");
const Category = require("../model/category");
const Product = require("../model/productModel");
const Banner = require("../model/banner");
const Coupon = require("../model/coupon");
const { path } = require("../routes/userRoute");
const banner = require("../model/banner");
const bcrypt = require("bcrypt");
const order = require("../model/order");
const imageCrop = require("cropperjs");

const ejs = require("ejs");
const pdf = require("html-pdf");
const fs = require("fs");
const paths = require("path");
const userPerPage = 10;

const loadlogin = async (req, res) => {
  res.render("login");
};

const logout = async (req, res) => {
  try {
    req.session.adminId = null;
    res.redirect("/admin/login");
  } catch (error) {
    console.log(error.message);
  }
};
const verifyadmin = async (req, res) => {
  try {
    const admin = await User.findOne({ is_admin: 1, email: req.body.email });
    const reqpass = req.body.password;
    const passwordMatch = await bcrypt.compare(reqpass, admin.password);

    if (passwordMatch) {
      req.session.adminId = admin._id;
      res.redirect("/admin");
    }else{
      
    }
  } catch (error) {
    console.log(error.message);
  }
};

// const adminloadhome = async (req, res) => {
//   try {

//     res.render('admin', { path: '/admin'})
//   } catch (error) {
//     console.log(error.message)
//   }
// }

const adminloadhome = async (req, res) => {
  try {
    const orders = await order.find();
    const xxx = await order.aggregate([
      {
        $group: {
          _id: { $dayOfWeek: { date: "$createdAt" } },
          totalPrice: { $sum: "$products.totalPrice" },
        },
      },
    ]);
    const count = await order.find().count();
    const products = await Product.count();
    const users = await User.count();

    const a = xxx.map((x) => x._id);
    const amount = xxx.map((x) => x.totalPrice);

    res.render("admin", {
      path: "/admin",
      amount,
      count,
      products,
      users,
    });
  } catch (error) {
    console.log(error.message);
  }
};

// HTML to PDF --------
const exportInvoice = async (req, res) => {
  try {
    const orders = await order.find();

    const count = await order.find().count();

    const data = { orders, count };
    const filePathName = paths.resolve(
      __dirname,
      "../views/admin/htmltopdf.ejs"
    );
    const htmlString = fs.readFileSync(filePathName).toString();

    let options = { Format: "Letter" };

    const ejsData = ejs.render(htmlString, data);
    pdf.create(ejsData, options).toFile("salesReport.pdf", (err, response) => {
      if (err) console.log(err);

      const filePath = paths.resolve(__dirname, "../SalesReport.pdf");

      fs.readFile(filePath, (err, file) => {
        if (err) {
          console.log(err);
          return res.status(500).send("Could not download File");
        }
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          'attachment;filename="Invoice.pdf"'
        );
        res.send(file);
      });
      // res.redirect("/admin")
    });
  } catch (error) {
    console.log(error);
  }
};
const getUsers = async (req, res) => {
  try {
    let users = req.body.users.trim();
    let search = await User.find({
      name: { $regex: new RegExp("^" + users + ".*", "i") },
    }).exec();

    search = search.slice(0, 4);
    res.send({ users: search });
  } catch (error) {
    console.log(error.messaage);
  }
};

// const getSingleUser =async (req,res) =>{
//   try {
//       const id = req.query.id;
//       const userData = await User.findById({ _id: id });
//       res.render("singleUser",{path: '/admin/user',userData})
//   } catch (error) {
//       console.log(error.messaage);
//   }
// }

const adminloaduser = async (req, res) => {
  try {
    const page = req.query.page;
    const userData = await User.find({ is_admin: 0 })
      .sort({ name: 1 })
      .skip((page - 1) * userPerPage)
      .limit(userPerPage);
    res.render("user", { path: "/admin/user", users: userData });
  } catch (error) {
    console.log(error.message);
  }
};

const adminloadproduct = async (req, res) => {
  try {
    const productData = await Product.find({});
    res.render("products", { path: "/admin/products", products: productData });
  } catch (error) {
    console.log(error.message);
  }
};
const adminloadaddproduct = async (req, res) => {
  try {
    const productCategory = await Category.find();

    res.render("addProducts", {
      path: "/admin/products",
      category: productCategory,
      message: req.flash("message"),
    });
  } catch (error) {
    console.log(error.message);
  }
};

const addProduct = async (req, res) => {
  try {
    const files = req.files;
    const Products = new Product({
      product: req.body.product,
      productprize: req.body.productprize,
      stock: req.body.stock,
      category: req.body.category,
      image: files.map((x) => x.filename),
      descreption: req.body.descreption,
    });
    const productData = await Products.save();
    if (productData) {
      req.flash("message", "Registration sucessfull");
      res.redirect("/admin/addProducts");
    } else {
      req.flash("message", "Fill the fields");
      res.redirect("/admin/addProducts");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const loadEditProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const category = await Category.find();
    const productData = await Product.findById({ _id: id });
    res.render("editproduct", {
      path: "/admin/products",
      category,
      product: productData,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const updateEditProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const product = req.body.product;
    const productprize = req.body.productprize;
    const stock = req.body.stock;
    const category = req.body.category;
    const descreption = req.body.descreption;
    if (req.files) {
      const files = req.files;
      const image = files.map((x) => x.filename);

      await Product.updateOne(
        { _id: id },
        {
          $set: {
            product,
            productprize,
            stock,
            category,
            image,
            descreption,
          },
        }
      );
    } else {
      const result = await Product.updateOne(
        { _id: id },
        {
          $set: {
            product,
            productprize,
            stock,
            category,
            descreption,
          },
        }
      );
    }
    res.redirect("/admin/products");
  } catch (error) {
    console.log(error.message);
  }
};

const deleteproduct = async (req, res) => {
  try {
    await Product.deleteOne({ _id: req.query.id });
    res.redirect("/admin/products");
  } catch (error) {
    console.log(error.message);
  }
};

const blockUser = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findById({ _id: id });
    if (userData.isVerified) {
      await User.findByIdAndUpdate({ _id: id }, { $set: { isVerified: 0 } });
    } else {
      await User.findByIdAndUpdate({ _id: id }, { $set: { isVerified: 1 } });
    }
    res.redirect("/admin/user");
  } catch (error) {
    console.log(error.message);
  }
};

const loadcategory = async (req, res) => {
  try {
    const productCategory = await Category.find();
    res.render("category", {
      path: "/admin/category",
      category: productCategory,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const addcategory = async (req, res) => {
  try {
    const reqCategory = req.body.category;
    const checkExist = await Category.findOne({
      category: { $regex: new RegExp("^" + reqCategory.toLowerCase(), "i") },
    });

    if (!checkExist) {
      const category = new Category({
        category: req.body.category,
      });
      const categoryData = await category.save();
    } else {
      productCategory = await Category.find();
      res.render("category", {
        path: "/admin/category",
        category: productCategory,
        message: "category already exist",
      });
    }
    res.redirect("category");
  } catch (error) {
    console.log(error.message);
  }
};

const deletecategory = async (req, res) => {
  try {
    const id = req.query.id;
    const categoryData = Category.findById({ _id: id });
    const categoryProductExist = await Product.findOne({
      category: categoryData.category,
    });
    if (!categoryProductExist) {
      if (categoryData) {
        await Category.deleteOne({ _id: id });
        res.redirect("category");
      }
    } else {
      res.render("category", { message: "Product with this category exist" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadbanner = async (req, res) => {
  try {
    // image: req.file.filename,
    const bannerdata = await Banner.find();

    res.render("banner", { path: "/admin/banner", banner: bannerdata });
  } catch (error) {
    console.log(error.message);
  }
};

const addbanner = async (req, res) => {
  try {
    const files = req.files;
    const banner = new Banner({
      name: req.body.name,
      image: files.map((x) => x.filename),
    });
    const bannerdata = await banner.save();
    if (bannerdata) {
      res.redirect("/admin/banner");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const bannerAction = async (req, res) => {
  try {
    const id = req.query.id;
    await banner.findOneAndUpdate({ active: 1 }, { $set: { active: 0 } });
    await banner.findByIdAndUpdate({ _id: id }, { $set: { active: 1 } });
    res.redirect("/admin/banner");
  } catch (error) {
    console.log(error.message);
  }
};

// function changedateformat (val) {
//   const myArray = val.split('-')

//   const year = myArray[0]
//   const month = myArray[1]
//   const day = myArray[2]

//   const formatteddate = day + '/' + month + '/' + year
//   return formatteddate
// }

const loadAdminCoupons = async (req, res) => {
  try {
    const coupon = await Coupon.find();
    console.log(coupon);
    res.render("coupon", {
      path: "/admin/coupon",
      coupon,
    });
  } catch (error) {
    console.log(error.message);
  }
};
const loadAddCoupons = async (req, res) => {
  try {
    res.render("addCoupon", { path: "/admin/coupon" });
  } catch (error) {
    console.log(error.message);
  }
};
const insertCoupons = async (req, res) => {
  try {
    const newCoupon = new Coupon({
      code: req.body.code,
      value: req.body.value,
      minbill: req.body.minbill,
      name: req.body.name,
    });
    const couponData = await newCoupon.save();
    if (couponData) {
      res.redirect("/admin/coupon");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const activateCoupons = async (req, res) => {
  try {
    const id = req.query.id;
    const couponData = await Coupon.findOne({ _id: id });

    if (couponData.status == 1) {
      await Coupon.findByIdAndUpdate({ _id: id }, { $set: { status: 0 } });

      return res.redirect("/admin/coupon");
    } else {
      await Coupon.findByIdAndUpdate({ _id: id }, { $set: { status: 1 } });
      return res.redirect("/admin/coupon");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const getOrders = async (req, res) => {
  try {
    const orderData = await order.find();
    res.render("order", { order: orderData, path: "/orders" });
  } catch (error) {
    console.log(error.message);
  }
};

const postOrder = async (req, res) => {
  try {
    const orderId = req.body.id;
    const newStatus = req.body.status;
    const orderData = await order.findByIdAndUpdate(
      { _id: orderId },
      { $set: { status: newStatus } }
    );
    res.redirect("/admin/orders");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  adminloadhome,
  adminloaduser,
  adminloadproduct,
  adminloadaddproduct,
  blockUser,
  loadlogin,
  verifyadmin,
  addProduct,
  loadcategory,
  addcategory,
  deletecategory,
  updateEditProduct,
  loadEditProduct,
  deleteproduct,
  loadbanner,
  addbanner,
  bannerAction,
  loadAdminCoupons,
  loadAddCoupons,
  activateCoupons,
  insertCoupons,
  logout,
  getUsers,
  getOrders,
  postOrder,
  exportInvoice,
  // activateCoupons
};
