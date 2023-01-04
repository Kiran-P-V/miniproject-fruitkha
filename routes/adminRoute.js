const express = require("express");
const router = express();
router.set("views", "./views/admin");
const adminController = require("../controllers/adminController");
const multer = require("../util/multer");
const adminauth = require("../middleware/adminauth");
const { route } = require("./userRoute");

// router.use('/',express.static('public'));

router.get("/login", adminauth.islogout, adminController.loadlogin);
router.get("/logout", adminController.logout);
router.post("/getUsers", adminController.getUsers);
// router.get('/singleUser',adminController.getSingleUser)

router.post("/login", adminController.verifyadmin);
router.get("/", adminauth.islogin, adminController.adminloadhome);
router.get('/salesReport',adminauth.islogin,adminController.exportInvoice)
router.get("/user", adminauth.islogin, adminController.adminloaduser);
router.get("/products", adminauth.islogin, adminController.adminloadproduct);
router.get(
  "/addProducts",
  adminauth.islogin,
  adminController.adminloadaddproduct
);
router.get("/block-user", adminauth.islogin, adminController.blockUser);
router.post(
  "/addProducts",
  multer.upload.array("uploaded_file"),
  adminController.addProduct
);
router.get("/editproduct", adminauth.islogin, adminController.loadEditProduct);
router.post(
  "/editproduct",
  multer.upload.single("uploaded_file"),
  adminController.updateEditProduct
);
router.get("/deleteproduct", adminController.deleteproduct);
router.get("/category", adminauth.islogin, adminController.loadcategory);
router.post("/category", adminController.addcategory);
router.get("/delete-category", adminController.deletecategory);
router.get("/banner", adminauth.islogin, adminController.loadbanner);
router.post(
  "/banner",
  multer.upload.array("uploaded_file", 3),
  adminController.addbanner
);
router.get("/bannerAction", adminController.bannerAction);
router.get("/coupon", adminauth.islogin, adminController.loadAdminCoupons);
router.get("/addCoupon", adminauth.islogin, adminController.loadAddCoupons);
router.post("/addCoupon", adminController.insertCoupons);
router.get("/activateCoupons", adminController.activateCoupons);

router.get("/orders", adminauth.islogin, adminController.getOrders);
router.post("/orders", adminController.postOrder);

module.exports = router;
