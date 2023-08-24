const express = require('express');
const adminRoute = express.Router();
const adminController = require('../controllers/adminController');
const productController = require('../controllers/productController');
const couponController = require('../controllers/couponController');
const bannerController = require('../controllers/bannerController');
const multerMid = require('../middlewares/multerMiddleware');
const adminAuth = require('../middlewares/adaminAuth')


//USER MANAGEMENT
//admin login
adminRoute.get('/',adminAuth.isAdminLoggedOut,adminController.adminLoginPage);
adminRoute.post('/',adminController.adminlogin);

//admin dashboard
adminRoute.get('/dashboard',adminAuth.isAdminLoggedIn,adminController.dashboard);

//sales report
adminRoute.post('/dashboard/sales-report',adminController.salesReport);

//all users
adminRoute.get('/users',adminAuth.isAdminLoggedIn,adminController.allUsers);

//block a user
adminRoute.get('/user/block_user/:id',adminAuth.isAdminLoggedIn,adminController.blockUser);


//banner change
adminRoute.get('/banners',adminAuth.isAdminLoggedIn,bannerController.viewBanners);
adminRoute.post('/banners/updateBanners',multerMid.upload.array('banner'),bannerController.bannerUpdate);
//banner delete
adminRoute.get('/banner/deleteBanner/:filename',adminAuth.isAdminLoggedIn,bannerController.deleteBanner);


//CATEGORY MANAGEMENT
//category page get
adminRoute.get('/category',adminAuth.isAdminLoggedIn,productController.category);

//save edited category
adminRoute.post('/editCategory',productController.editCategory);

//hide category
adminRoute.get('/hideCategory/:categoryId',productController.hideCategory);

//add category
adminRoute.post('/products/add_category',productController.addCategory);

//add brand under a category
adminRoute.post('/products/add_brand',productController.addBrand);

//add size under a category
adminRoute.post('/products/add_size',productController.addSize);


//PRODUCTS MANAGEMENT
//add new product
adminRoute.post('/products/add_product',multerMid.upload.array('image') ,productController.addProduct);

//edit product details
adminRoute.get('/products/edit_Product/:id',adminAuth.isAdminLoggedIn,productController.editProduct);
adminRoute.post('/products/updateProduct',multerMid.upload.array('image') ,productController.updateProduct);

//list all products
adminRoute.get('/products',adminAuth.isAdminLoggedIn,productController.viewProducts);

//hide product
adminRoute.get('/products/hideProduct/:id',adminAuth.isAdminLoggedIn,productController.hideProduct);

//delete product image when item editing
adminRoute.get('/products/deleteImg',adminAuth.isAdminLoggedIn,productController.deleteImage);

//order management
adminRoute.get('/orderManagement',adminAuth.isAdminLoggedIn,adminController.orderManagement);

//change order status in admin panel
adminRoute.post('/changeOrderStatus',adminController.changeOrderStatus);



//USER COUPON MANAGEMENT
//coupon page
adminRoute.get('/coupons',adminAuth.isAdminLoggedIn,couponController.couponDetails);

//new coupon add
adminRoute.post('/coupons/add_coupon',couponController.couponAdd);

//coupon edit page
adminRoute.get('/coupons/edit_coupon/:coupon_id',adminAuth.isAdminLoggedIn,couponController.editCoupon);
adminRoute.post('/couponEdit',couponController.couponEdit);

//hide coupon
adminRoute.get('/hideCoupon/:coupon_id',adminAuth.isAdminLoggedIn,couponController.hideCoupon);

//admin logout
adminRoute.get('/logout',adminController.adminLogout);

// AJAX API QUERY FOR PRODUCT EDIT CATEGORY DROPDOWN
//ajax
adminRoute.get('/api/endpoint',adminAuth.isAdminLoggedIn,productController.selectBrand);
// adminRoute.get('/api/getProduct',adminController.getItemEdit);



module.exports = adminRoute;