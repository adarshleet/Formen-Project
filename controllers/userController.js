
const User = require('../models/userModel');
const Order = require('../models/orderModel');
const Address = require('../models/addressModel');
const Coupon = require('../models/couponModel');
const Cart = require('../models/cartModel');
const Banner = require('../models/bannerModel');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const bcrypt = require('bcrypt');
const node_pass = process.env.NODE_PASS
const contact_mail = process.env.CONTACT_MAIL
// const nodemailer = require('nodemailer')
const {sendOTP,verifyOTP,resendOTP}= require('otpless-node-js-auth-sdk')
const {sendOtp,verifyOtp,resendOtp} = require('../utils/OtpServices')




//user signup GET
exports.userSignup =async (req,res,next) =>{
    try {
        //cart items count
        const user_id = req.session.user_id
        const cart = await Cart.findOne({user:user_id})
        let cartItems
        if(user_id && cart){
            cartItems = cart.product.length
        }

        const referral = req.query.referral
        const category = await Category.find({})
        var context = req.app.locals.specialContext;
        req.app.locals.specialContext = null;
        res.render('user/userSignup',{context,category,referral,title:'Signup',cartItems});
    } catch (error) {
        next(error)
    }
}



//new user signup POST
let details
exports.signup = async (req,res) =>{
    try {
        const {name,mobile,password,confirmPassword,referral} = req.body;
        details = {name,mobile,password,confirmPassword,referral};
        
        //check if the mobile is already registered
        const existingUser = await User.findOne({mobile});
        if(existingUser){
            req.app.locals.specialContext = 'Mobile Number already registered';
            res.redirect('/signup')
        }

        else{
           
            const response = await sendOtp(mobile)
            req.session.orderIdOtp =  response.orderId
            req.session.otpPageForSignUp = true
            res.redirect(`/verifyOtp/?mobile=${mobile}`)
        }
        
    } 
    catch (error) {
        console.error(error);
    }
}


//user otp verify
exports.otpVerfy = async (req,res) =>{
    
    try {
        const {mobile,otp} = req.body

        const orderId = req.session.orderIdOtp
       
        const response = await verifyOtp(mobile,otp,orderId)

        if (response.isOTPVerified) {
            const {name,mobile,password,referral} = details;
            // hash the password
            const hashedPassword = await bcrypt.hash(password,10);
            
            // generate referral id
            function generateRandomString() {
                const length = 5
                const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
                let randomString = '';
                for (let i = 0; i < length; i++) {
                    const isLetter = i % 2 === 0;
                    const characterPool = isLetter ? characters.slice(0, 26) : characters.slice(26);
                    const randomIndex = Math.floor(Math.random() * characterPool.length);
                    randomString += characterPool.charAt(randomIndex);
                }
                return randomString;
            }
              
            let randomString = generateRandomString();
            const sameReferal = await User.findOne({referralCode:randomString})
            if(sameReferal){
                generateRandomString()
            }

            //referral checking
            let wallet = 0
            if(referral){
                const referralFound = await User.findOne({referralCode:referral})
                if(referralFound){
                    await User.findOneAndUpdate(
                        { referralCode: referral },
                        {
                          $inc: { wallet: 500 },
                          $push: {
                            walletHistory: {
                              transactionType: 'Referral Earn',
                              method: 'Credit',
                              amount: 500,
                              date: new Date()
                            }
                          }
                    });
                    wallet = 500
                }
                else{
                    
                    return res.redirect('/signup')
                }
            }


            if(referral){
                const newUser = new User({
                    name,
                    mobile,
                    password:hashedPassword,
                    referralCode : randomString,
                    wallet,
                    walletHistory:[{
                        transactionType: 'Referred Login Earn',
                        method: 'Credit',
                        amount: 500,
                        date: new Date()
                    }]
                });
                await newUser.save();
            }
            else{
                const newUser = new User({
                    name,
                    mobile,
                    password:hashedPassword,
                    referralCode : randomString,
                    wallet
                });
                await newUser.save();
            }
            
            req.app.locals.specialContext = 'Welcome to ForMen. Please login';
            res.redirect('/login')
        }   
        else{
            req.app.locals.specialContext = 'Invaid otp. Please enter the correct otp';
            res.redirect(`/verifyOtp/?mobile=${mobile}`);
        }
    } catch (error) {
        console.log(error.message);
    }
}

//resend otp
exports.resendOtp = async (req,res) =>{
    try {
        const mobile = details.mobile
        const orderId = req.session.orderIdOtp
        const response = await resendOtp(orderId)
        console.log(response)
        res.redirect(`/verifyOtp/?mobile=${mobile}`)
    } catch (error) {
        console.log(error.message);
    }
}

//user otp verify GET
exports.verifyOtp = async (req,res,next) =>{
    try {
        //cart items count
        const user_id = req.session.user_id
        const cart = await Cart.findOne({user:user_id})
        let cartItems
        if(user_id && cart){
            cartItems = cart.product.length
        }

        if(req.session.otpPageForSignUp){
            var context = req.app.locals.specialContext;
            req.app.locals.specialContext = null;
            const mobile = req.query.mobile
            res.render('user/otpPage',{mobile,context,cartItems,title:'Verify'})
        }
        else{
            next(error)
        }
    } catch (error) {
        next(error)
    }
}



//user login get
exports.userLogin = async (req,res,next) =>{
    const category = await Category.find({})
    try {
        //cart items count
        const user_id = req.session.user_id;
        const cart = await Cart.findOne({user:user_id})
        let cartItems
        if(user_id && cart){
            cartItems = cart.product.length
        }

        var context = req.app.locals.specialContext;
        req.app.locals.specialContext = null;
        res.render('user/userLogin',{context,category,cartItems,title:'Login'})
    } catch (error) {
        next(error)
    }
}


//user login POST
exports.login = async (req,res) =>{
    try{
        const {mobile,password} = req.body;
        const user = await User.findOne({mobile});
        
        //user existing check
        if(!user){
            req.app.locals.specialContext = 'Invalid Mobile Number or Password';
            res.redirect('/login')
        }

        else{
            //user password check
            const isPasswordValid = await bcrypt.compare(password,user.password)

            if(isPasswordValid){
                if(user.isBlocked === true){
                    req.app.locals.specialContext = 'You have been blocked';
                    res.redirect('/login')
                }
                else{
                    req.session.user_id = user._id;
                    res.redirect('/');
                }
            }
        
            //redirect to home page
            else{
                req.app.locals.specialContext = 'Invalid Mobile Number or Password';
                res.redirect('/login')
            }
        }
    }
    catch(error){
        console.log(error.message);
    }
}


//user home render
exports.Home = async (req,res,next) =>{
    //cart items count
    const user_id = req.session.user_id;
    const cart = await Cart.findOne({user:user_id})
    let cartItems
    if(user_id && cart){
        cartItems = cart.product.length
    }

    const category = await Category.find({})
    const banner = await Banner.findOne({})

    const jeans_id = await Category.findOne({category:'jeans'},{_id:1})
    const jeans = await Product.find({category:jeans_id?.id,show_status:true}).sort({addedDate:-1}).limit(4)

    const shirt_id = await Category.findOne({category:'shirt'},{_id:1})
    const shirts = await Product.find({category:shirt_id?.id,show_status:true}).sort({addedDate:-1}).limit(4)

    const tshirt_id = await Category.findOne({category:'t-shirt'},{_id:1})
    const tshirts = await Product.find({category:tshirt_id?.id,show_status:true}).sort({addedDate:-1}).limit(4)

    const cap_id = await Category.findOne({category:'cap'},{_id:1})
    const caps = await Product.find({category:cap_id?.id,show_status:true}).sort({addedDate:-1}).limit(4)

    
    try {
        res.render('user/home',{category,banner,jeans,shirts,tshirts,caps,title:'Home',cartItems});
    } catch (error) {
        next(error)
    }
}


//contact form
exports.contactForm = async (req,res,next) =>{
    try {
        var context = req.app.locals.specialContext;
        req.app.locals.specialContext = null;
        res.render("user/contactAdmin",{title:"Contact-Form",context});
    } catch (error) {
        next(error)
    }
}

// exports.contactAdmin = async (req,res) =>{
//     try {
//         const {name,email,mobile,message} = req.body
//         console.log(name,email,mobile,message);

//         const contactMail = (name, email, message,mobile) => {
//             const mailTransporter = nodemailer.createTransport({
//               service: "gmail",
//               auth: {
//                 user: "adarshravi0111@gmail.com",
//                 pass: node_pass,
//               },
//             });
          
          
//             const mailOptions = {
//               from: "adarshravi0111@gmail.com",
//               to: contact_mail,
//               subject: "Formen Contact",
//               text: `Name : ${name} \nEmail : ${email} \nMobile : ${mobile}.\nMessage : ${message}`,
//             };
          
//             mailTransporter.sendMail(mailOptions, (err) => {
//               if (err) {
//                 console.log(err);
//               } else {
//                 console.log("Message sent successfully");
//                 req.app.locals.specialContext = 'Message Sent Successfully';
//                 res.redirect('/contact-us')
//               }
//             });
//           };

//           contactMail(name,email,message,mobile)

//     } catch (error) {
//         console.log(error.message);
//     }
// }


//USER PROFILE
//user profile GET
exports.profile = async (req,res,next) =>{
    try {
        const user_id = req.session.user_id;

        //cart items count
        const cart = await Cart.findOne({user:user_id})
        let cartItems
        if(user_id && cart){
            cartItems = cart.product.length
        }

        const category = await Category.find({})
        const user = await User.findById(user_id)
        res.render('user/userProfile',{user,category,cartItems,title:'Profile'});
    } catch (error) {
        next(error)
    }
}


//user orders and returns
exports.ordersAndReturns = async(req,res,next) =>{
    try {
        const user_id = req.session.user_id;
        const category = await Category.find({})
        const user = await User.findById(user_id)

        //cart items count
        const cart = await Cart.findOne({user:user_id})
        let cartItems
        if(user_id && cart){
            cartItems = cart.product.length
        }
        

        const page = req.query.page || 1;
        const limit = 10

        let orders = await Order.find({user:user_id}).populate('orders.product').limit(limit*1).skip((page-1)*limit).sort({'orders.orderDate':-1})
        let ordersCount = await Order.find({user:user_id}).countDocuments()

        res.render('user/ordersAndReturns',{user,orders,category,
            ordersCount,
            totalPages: Math.ceil(ordersCount/limit),
            limit,
            page,
            title:'Orders & Returns',
            cartItems
        });
    } catch (error) {
       next(error)
    }
}


//orders detailed view page
exports.orderDetails = async(req,res,next) =>{
    try {
        //category for sidebar
        const category = await Category.find();

        const user_id = req.session.user_id;

        //cart items count
        const cart = await Cart.findOne({user:user_id})
        let cartItems
        if(user_id && cart){
            cartItems = cart.product.length
        }

        const order_id = req.params.order_id;

        //finding the specific order
        const order = await Order.findOne(
            {
              user: user_id,
              orders: { $elemMatch: { _id: order_id } }
            },
            { 'orders.$': 1 }
          )
          .populate('orders.product')

        //finding coupon used for showing
        const usedCoupon = await Coupon.findOne({couponName:order.couponUsed})
        
        res.render('user/detailedOrder',{category,order:order.orders[0],usedCoupon,title: 'Order Details',cartItems});
    } catch (error) {
        next(error)
    }
}



//user profile edit GET
exports.editProfile = async (req,res,next) =>{
    try {
        const user_id = req.session.user_id;

        //cart items count
        const cart = await Cart.findOne({user:user_id})
        let cartItems
        if(user_id && cart){
            cartItems = cart.product.length
        }

        const user = await User.findById(user_id);
        const category = await Category.find();
        res.render('user/profileEdit',{user,category,cartItems,title:'Edit Profile'});
    } catch (error) {
        next(error)
    }
}

//user profile edit POST
exports.profileEdit = async (req,res) =>{
    try {
        const user_id  = req.session.user_id;
        const {name,email,gender} = req.body;
        await User.findByIdAndUpdate(user_id,{$set:{name,email,gender}});
        res.redirect('/profile')
    } catch (error) {
        console.log(error.message);
    }
}


//user password change POST
exports.changePassword = async (req,res) =>{
    try {
        const user_id = req.session.user_id
        const user = await User.findById(user_id)

        const {currentPassword,password,confirmPassword} = req.body
        
        if(currentPassword == '' || password =='' || confirmPassword == ''){
            return res.json({status:'empty'})
        }
        else if(password != confirmPassword){
            return res.json({status:'different'})
        }

        const isPasswordValid = await bcrypt.compare(currentPassword,user.password)
        if(!isPasswordValid){
            return res.json({status:'not Match'})
        }
        else{
            // hash the password
            const hashedPassword = await bcrypt.hash(password,10);
            await User.findByIdAndUpdate(user_id,{$set:{password:hashedPassword}})
            return res.json({status:'done'})
        }

    } catch (error) {
        console.log(error.message);
    }
}


//user mobile number change 
exports.mobileChange = async (req,res) =>{
    try {
        const user_id = req.session.user_id;
        const {mobile,password} = req.body;

        const user = await User.findById(user_id)
        //check password is correct
        const isPasswordValid = await bcrypt.compare(password,user.password);
        if(!isPasswordValid){
            res.json({status:'password'})
        }
        else{
            const mobileFound = await User.findOne({mobile})
            if(mobileFound){
                res.json({status:'mobile'})
            }
            else{
                const response = await sendOtp(mobile)
                req.session.orderIdOtp =  response.orderId
                req.session.otpPageForMobileChange = true
                res.json({status:true,mobile})
            }
        }




    } catch (error) {
        console.log(error.message);
    }
}


//mobile change otp page GET
exports.mobileChangeOtp = async (req,res,next) =>{
    try {
        if(req.session.otpPageForMobileChange){
            var context = req.app.locals.specialContext;
            req.app.locals.specialContext = null;
            const mobile = req.query.mobile;
            req.session.mobile = mobile;
            res.render('user/otpPageForMobile',{mobile,context,title:'Verify'});
        }
        else{
            next(error)
        }
    } catch (error) {
        next(error)
    }
}

//mobile number changing after otp verification
exports.mobileChangeConfirm = async (req,res) =>{
    try {
        const mobile = req.session.mobile
        const user_id = req.session.user_id

        const {otp} = req.body
        const orderId = req.session.orderIdOtp
        const response = await verifyOtp(mobile,otp,orderId)
        if (response.isOTPVerified) {
            //update mobile number
            await User.findByIdAndUpdate(user_id,{$set:{mobile}})
            res.redirect('/profile/edit')
        }
        else{
            req.app.locals.specialContext = 'Invaid otp. Please enter the correct otp';
            res.redirect(`/otpVerify?mobile=${mobile}`);
        }

    } catch (error) {
        console.log(error.message);
    }
}


//resend otp
exports.otpResend = async (req,res) =>{
    try {
        let mobile = req.session.mobile
        const orderId = req.session.orderIdOtp
        const response = await resendOtp(orderId)
        res.redirect(`/otpVerify/?mobile=${mobile}`)
    } catch (error) {
        console.log(error.message);
    }
}








//FORGOT PASSWORD
//reset password
exports.resetPassword = async (req,res,next) =>{
    try {
        res.render('user/forgotPassword',{title:'Reset Password'})
    } catch (error) {
        next(error)
    }
}


//send otp forgot password
exports.sendOtpForgotPassword = async (req,res) =>{
    try {
        const mobile = req.body.mobile;
        const user_id = req.session.user_id;
        const userFound = await User.findOne({mobile});
        console.log(userFound);

        if(!userFound){
            res.json({status:'mobile'});
        }
        else{
            const response = await sendOtp(mobile)
            req.session.orderIdOtp =  response.orderId
            req.session.otpForForgotPassword = true
            res.json({status:true,mobile});
        }
    } catch (error) {
        console.log(error.message);
    }
}


//otp verify page GET for forgot password
exports.otpVerifyForPasswordReset = async (req,res,next) =>{
    try {
        if(req.session.otpForForgotPassword){
            const mobile = req.query.mobile
            req.session.mobile = mobile
            res.render('user/otpForResetPass',{mobile,title:'Verify'});
        }
        else{
            next(error)
        }
    } catch (error) {
        next(error)
    }
}



//resend otp for forgot password
exports.resendOtpForgotPass = async (req,res) =>{
    try {
        const mobile = req.session.mobile;
        const orderId = req.session.orderIdOtp
        const response = await resendOtp(orderId)
        res.redirect(`/otp_reset_password?mobile=${mobile}`);
    } catch (error) {
        console.log(error.message);
    }
}


//otp verify for forgotPassword POST
exports.otpVerifyForResetPass = async (req,res) =>{
    try {
        const mobile = req.session.mobile
        const {otp} = req.body
        const orderId = req.session.orderIdOtp
        const response = await verifyOtp(mobile,otp,orderId)
        if (response.isOTPVerified) {
            req.session.passwordReset = true
            res.redirect('/passwordReset')
        }
        else{
            req.app.locals.specialContext = 'Invaid otp. Please enter the correct otp';
            res.redirect(`/otp_reset_password?mobile=${mobile}`);
        }


    } catch (error) {
        console.log(error.message);
    }
}


//forgot password. password change GET
exports.passwordChange = async (req,res,next) =>{
    try {
        if(req.session.passwordReset){
            var context = req.app.locals.specialContext;
            req.app.locals.specialContext = null;
            res.render('user/passwordChange',{context,title:'Password Reset'})
        }
        else{
            next(error)
        }
    } catch (error) {
        next(error)
    }
}

//forgot password. password reset POST
exports.passwordReset = async (req,res) =>{
    try {
        const {password,confirmPassword} = req.body;
        const mobile = req.session.mobile
        if(password != confirmPassword){
            req.app.locals.specialContext = 'passwords does not match';
            res.redirect(`/passwordReset`);
        }
        else{
            const hashedPassword = await bcrypt.hash(password,10);
            const user = await User.findOneAndUpdate({mobile},{$set:{password:hashedPassword}})
            req.app.locals.specialContext = 'passwords Changed Succesfully';
            res.redirect(`/login`);
        }
    } catch (error) {
        console.log(error.message);
    }
}





//user addresses in profile GET
exports.userAddresses = async (req,res,next) =>{
    try {
        //category for sidebar
        const category = await Category.find();
        const user_id = req.session.user_id;

        //cart items count
        const cart = await Cart.findOne({user:user_id})
        let cartItems
        if(user_id && cart){
            cartItems = cart.product.length
        }

        const user = await User.findById(user_id);
        const address = await Address.findOne({user})
        res.render('user/addressInProfile',{category,user,address,title:'Addresses',cartItems})
    } catch (error) {
        next(error)
    }
}


//user new address adding POST in profile
exports.addAddressInProfile = async (req,res) =>{
    try {
        const user = req.session.user_id;
        const {name,mobile,address,locality,pincode,district,state} = req.body;
        const userFound = await Address.findOne({user:user})
        if(!userFound){
            const newAddress = new Address({
                user,
                address:[{name,mobile,address,locality,pincode,district,state}]
            })
            await newAddress.save();
            res.redirect('/addresses')
        }
        else{
            await Address.findOneAndUpdate({user},{$push:{address:{name,mobile,address,locality,pincode,district,state}}});
            res.redirect('/addresses')
        }
    } catch (error) {
        console.log(error.message);
    }
}


//add address page profile
exports.addAddressProfile = async (req,res,next) =>{
    try {
        res.render('user/addNewAddressInProfile',{title:'Add New Address'});
    } catch (error) {
        next(error)
    }
}



//edit address GET in profile
exports.userAddressEdit = async (req,res,next) =>{
    try {
        const user = req.session.user_id;
        const address_id = req.params.address_id;
        const address = await Address.findOne({user},{address:{$elemMatch:{_id:address_id}}});
        res.render('user/editAddressInProfile',{address : address.address[0],title:"Edit Address"});
    } catch (error) {
        next(error)
    }
}

//user address edit POST
exports.userAddressEditProfile = async (req,res) =>{
    try {
        const address_id = req.body.id;
        const user = req.session.user_id;
        const {name,mobile,address,locality,pincode,district,state} = req.body;
        await Address.findOneAndUpdate({user:user,'address._id':address_id},{$set:{"address.$":{name,mobile,address,locality,pincode,district,state}}});
        res.redirect('/addresses');
    } catch (error) {
        console.log(error.message);
    }
}

//remove an address in profile
exports.removeAddressFromProfile = async (req,res) =>{
    try {
        const address = req.params.address_id;
        const user = req.session.user_id;
        await Address.findOneAndUpdate(
            {user: user },
            { $pull: { address: { _id: address } } })
        res.redirect('/addresses');
    } catch (error) {
        console.log(error.message);
    }
}


//user wallet in profile
exports.userWallet = async (req,res,next) =>{
    try {
        const user_id = req.session.user_id;
        const user = await User.findById(user_id)
        //category for sidebar
        const category = await Category.find();

        //cart items count
        const cart = await Cart.findOne({user:user_id})
        let cartItems
        if(user_id && cart){
            cartItems = cart.product.length
        }

        const walletHistory = user.walletHistory
        walletHistory.reverse()

        res.render('user/wallet',{category,user,walletHistory,cartItems,title:'Wallet'});
    } catch (error) {
        next(error)
    }
}



//user referral code in profile
exports.referralCode = async (req,res,next) =>{
    try {
        const user_id = req.session.user_id;
        const user = await User.findById({_id:user_id});

        //cart items count
        const cart = await Cart.findOne({user:user_id})
        let cartItems
        if(user_id && cart){
            cartItems = cart.product.length
        }

        const category = await Category.find({});
        res.render('user/refer',{category,user,cartItems,title:'Referral Link'});
    } catch (error) {
        next(error)
    }
}





//user logout
exports.userLogout = (req,res)=>{
    try{
        req.session.destroy();
        res.redirect('/login');
    }
    catch(error){
        console.log(error.message);
    }
}