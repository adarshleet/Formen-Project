const express = require('express');
const userRoute = express.Router();
const userController = require('../controllers/userController');
const productController = require('../controllers/productController');
const cartController = require('../controllers/cartController');
const addressController = require('../controllers/addressController');
const orderController = require('../controllers/orderController');
const couponController = require('../controllers/couponController');
const wishlistController = require('../controllers/wishlistController');
const reviewController = require('../controllers/reviewController');
const auth = require('../middlewares/authMiddleware');



// USER SETUPS
//signup
userRoute.post('/signup',userController.signup);
userRoute.get('/signup',auth.isLoggedOut,userController.userSignup);

//login
userRoute.post('/login',userController.login);
userRoute.get('/login',auth.isLoggedOut,userController.userLogin);

//user logout
userRoute.post('/logout',userController.userLogout);

//user otp verify
userRoute.post('/verifyOtp',userController.otpVerfy);
userRoute.get('/verifyOtp',userController.verifyOtp);

//resend OTP
userRoute.get('/resendOtp',userController.resendOtp)

//user home
userRoute.get('/',userController.Home);


//USER PRODUCT VIEWING
//shop-all products
userRoute.get('/shop',productController.allProducts);

//single product viewe
userRoute.get('/product',productController.singleProduct);


//contact admin
userRoute.get('/contact-us',userController.contactForm)

//contact form submit post
userRoute.post('/send-mail',userController.contactAdmin)





//USER PROFILE
//user profile
userRoute.get('/profile',auth.isLoggedIn,userController.profile);

//user orders and returns
userRoute.get('/orders&returns',auth.isLoggedIn,userController.ordersAndReturns);

//user order cancellation
userRoute.post('/cancelOrder/:order_id',orderController.cancelOrder);

//user order detailed view
userRoute.get('/order_details/:order_id',auth.isLoggedIn,userController.orderDetails);

//user profile edit
userRoute.post('/profileEdit',userController.profileEdit);
userRoute.get('/profile/edit',auth.isLoggedIn,userController.editProfile);

//user address edit in profile 
userRoute.get('/addresses',auth.isLoggedIn,userController.userAddresses);

//add new address in profile
userRoute.get('/addresses/addNewAddress',auth.isLoggedIn,userController.addAddressProfile);
userRoute.post('/addNewAddresses',userController.addAddressInProfile);

//edit user address in profile
userRoute.get('/addresses/editAddress/:address_id',auth.isLoggedIn,userController.userAddressEdit);
userRoute.post('/userAddressEdit',userController.userAddressEditProfile)

//delete user address from profile
userRoute.post('/deleteAddress/:address_id',userController.removeAddressFromProfile);

//wallet showing in profile
userRoute.get('/wallet',auth.isLoggedIn,userController.userWallet);

//referral id in profile
userRoute.get('/profile/referral',auth.isLoggedIn,userController.referralCode);


//change password for user
userRoute.post('/changePassword',userController.changePassword);

//change mobile for user
userRoute.post('/changeMobile',userController.mobileChange);

//otp verify for mobile number change
userRoute.get('/otpVerify',userController.mobileChangeOtp);

//otp resend for number change
userRoute.get('/otpResend',userController.otpResend);


//change mobile after otp validation
userRoute.post('/mobileChangeConfirm',userController.mobileChangeConfirm)


//FORGOT PASSWORD OPTION
//reset password
userRoute.get('/reset-password',userController.resetPassword)
userRoute.post('/sendOtpForgot',userController.sendOtpForgotPassword)

//otp validating for reset password
userRoute.get('/otp_reset_password',userController.otpVerifyForPasswordReset)
userRoute.post('/verifyOtpPassReset',userController.otpVerifyForResetPass)

//resent otp for forgot password
userRoute.get('/resendOtpPassReset',userController.resendOtpForgotPass)

//change password page
userRoute.get('/passwordReset',userController.passwordChange)
userRoute.post('/passwordReset',userController.passwordReset)



//PRODUCT REVIEWS
//review page get
userRoute.get('/product/reviews/:product_id',reviewController.productReviews)

//user adding review
userRoute.post('/submit-rating/:product_id',reviewController.newReview);



//USER CART
//cart view
userRoute.get('/cart',auth.isLoggedIn,cartController.cart);

//add to cart
userRoute.post('/addToCart/:prod_id',cartController.addToCart);

//change item count in cart
userRoute.post('/changeCount/:cart_id',cartController.changeCount);

//remove from cart
userRoute.post('/removeFromCart/:cart_id',cartController.removeProduct);


//USER COUPON SELECT
//coupon selecting
userRoute.post('/selectCoupon/:couponName',couponController.couponSelect);

//user coupon removing
userRoute.get('/coupon_remove',auth.isLoggedIn,couponController.couponRemove);


//APPLY WALLET
//user wallet using
userRoute.post('/apply_wallet/:toDo',orderController.applyWallet);



//USER WISHLIST
//user wishlist
userRoute.get('/wishlist',auth.isLoggedIn,wishlistController.wishlist);

//add to wishlist
userRoute.post('/wishlist/:product_id',wishlistController.addToWishlist);

//remove product from wishlist
userRoute.get('/removeFromWishlist/:product_id',auth.isLoggedIn,wishlistController.removeFromWishlist);

//move to bag from wishlist
userRoute.get('/moveToBag/:product_id',auth.isLoggedIn,wishlistController.moveToBag);



//USERS ADDRESS CHECKOUT
//address selection in cart
userRoute.get('/address',auth.isLoggedIn,addressController.addressSelection);
userRoute.post('/addressSelection',addressController.addressSelected);


//new address add
userRoute.get('/addNewAddress',auth.isLoggedIn,addressController.addNewAddress);
userRoute.post('/addNewAddress',addressController.addAddress);

//remove an address
userRoute.post('/removeAddress/:address_id',addressController.removeAddress);

//edit existing address
userRoute.get('/editAddress/:address_id',auth.isLoggedIn,addressController.editAddress);
userRoute.post('/editAddress',addressController.editAnAddress);

//payment page
userRoute.get('/payment',auth.isLoggedIn,orderController.payment);
userRoute.post('/payment',orderController.paymentDone);

//order placed
userRoute.get('/orderSuccess',auth.isLoggedIn,orderController.orderPlaced);

//razorpay order verify
userRoute.post('/verifyPayment',orderController.verifyPayment);


//404 error middlewares
userRoute.use((err, req, res, next) => {
    console.log(err.message);
    res.status(err.status || 404).render('user/404',{title:'Not Found'})
})



module.exports = userRoute;