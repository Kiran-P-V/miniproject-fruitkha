const express = require('express')
const userController = require('../controllers/userController')
const userRoute = express()
const userauth=require('../middleware/userauth')


userRoute.set('views', './views/user')
// userRoute.use('/',express.static('public'));

userRoute.get('/login',userauth.islogout, userController.loginuser)
userRoute.get('/logout', userController.logout)
userRoute.post('/login', userController.verifylogin)
userRoute.post('/getSearch',userController.getSearch)
userRoute.get('/', userController.loadHome)

userRoute.get('/register', userController.loadRegister) 
userRoute.get('/verifyOtp', userController.loadOtp)
userRoute.post('/verifyOtp', userController.verifyOtp) 
userRoute.post('/register', userController.insertuser)

userRoute.get('/cart',userauth.islogin, userController.loadCart)
userRoute.get('/addToCart',userauth.islogin,userController.addToCart)
userRoute.get('/deletecart',userController.deleteCart)
userRoute.post('/editQty',userController.editqty)
userRoute.post('/checkCoupon',userauth.islogin,userController.checkCoupon) 
userRoute.get('/wishlist',userController.loadWishlist)
userRoute.get('/addtowishlist',userController.addToWishlist)
userRoute.get('/deletewishlist',userController.deleteWishlist)
userRoute.get('/about', userController.loadabout)
userRoute.get('/contact', userController.loadcontact)
userRoute.get('/checkout',userauth.islogin, userController.loadcheckout)
userRoute.post('/placeOrder',userController.createOrder)
userRoute.get('/razorpay',userauth.islogin,userController.loadRazorpay)
userRoute.post('/razorpay',userController.razorpayCheckout)
userRoute.get('/shop', userController.loadshop)
userRoute.get('/singleproduct', userController.loadsingleproduct)
userRoute.get('/profile',userauth.islogin, userController.profile)
userRoute.post('/editProfile',userauth.islogin,userController.userDetails)
userRoute.get('/orderSuccess',userauth.islogin,userController.orderSuccess)
userRoute.get('/myorders',userauth.islogin,userController.myOrders)
userRoute.get('/cancelOrder',userauth.islogin,userController.cancelOrder)
userRoute.get('/viewOrder',userauth.islogin,userController.viewOrder)


userRoute.use((req, res, next) => {
  res.render('404')
})

module.exports = userRoute
