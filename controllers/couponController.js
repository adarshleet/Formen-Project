const Coupon = require('../models/couponModel');
const Category = require('../models/categoryModel');
const Cart = require('../models/cartModel');

//ADMIN SIDE
//coupon viewing table
exports.couponDetails = async (req,res) =>{
    try {
        var context = req.app.locals.specialContext;
        req.app.locals.specialContext = null;

        const coupon = await Coupon.find();
        res.render('admin/coupons',{coupon,context,title : 'Coupons'})
    } catch (error) {
        console.log(error.message);
    }
}


//add new coupon
exports.couponAdd = async (req,res) =>{
    try {
        const {couponName,discount,minPurchase,maxDiscount,date,description} = req.body
        const couponFound = await Coupon.findOne({couponName})
        if(couponFound){
            req.app.locals.specialContext = 'Existing Coupon name';
            res.redirect(`/admin/coupons`);
        }
        else{
            const newCoupon = new Coupon ({
                couponName,
                minimumPurchase:minPurchase,
                maximumDiscount:maxDiscount,
                lastDate:date,
            })
            await newCoupon.save();
            req.app.locals.specialContext = 'New coupon added';
            res.redirect('/admin/coupons')
        }
    } catch (error) {
        console.log(error.message);
    }
}

//edit coupon GET
exports.editCoupon = async (req,res) =>{
    try {
        const coupon_id = req.params.coupon_id;
        const coupon = await Coupon.findById(coupon_id)
        res.render('admin/couponEdit',{coupon,title:'Edit Coupon'});
    } catch (error) {
        console.log(error.message);
    }
}


//edit coupon
exports.couponEdit = async (req,res) =>{
    try {
        const {coupon_id,couponName,discount,minPurchase,maxDiscount,date,description} = req.body
        const couponFound = await Coupon.findById(coupon_id);
        if(couponFound){
            const updatedCoupon = {
                couponName,
                minimumPurchase:minPurchase,
                maximumDiscount:maxDiscount,
                lastDate:date,
            }
            await Coupon.findByIdAndUpdate(coupon_id,{$set:updatedCoupon});
            req.app.locals.specialContext = 'Coupon details updated';
            res.redirect('/admin/coupons')
        }
        else{
            req.app.locals.specialContext = 'some error occured';
            res.redirect('/admin/coupons')
        }
    } catch (error) {
        console.log(error.message);
    }
}


//hide coupon
exports.hideCoupon = async (req,res) =>{
    try {
        const coupon_id = req.params.coupon_id;
        const couponFound = await Coupon.findById(coupon_id);
        if(couponFound){
            if(couponFound.showStatus === true){
                req.app.locals.specialContext = 'Coupon visibility changed to - HIDDEN';
                await Coupon.findByIdAndUpdate(coupon_id,{$set:{showStatus:false}})
            }
            else{
                req.app.locals.specialContext = 'Coupon visibility changed to - SHOW';
                await Coupon.findByIdAndUpdate(coupon_id,{$set:{showStatus:true}})
            }
        }
        else{
            req.app.locals.specialContext = 'some error occured';
        }
        res.redirect('/admin/coupons')
    } catch (error) {
        console.log(error.message);
    }
}



//USER SIDE
//applying coupon by user
exports.couponSelect = async (req,res,next) =>{
    try {
        //calculating total amount
        const user = req.session.user_id;
        const getCart = await Cart.findOne({user}).populate('product.product_id');
        const cart = getCart.product
        let totalAmound = 0,currentDate = new Date();
        totalAmound += cart.map(item => item.product_id.sellingPrice*item.count).reduce((accumulator, currentValue) => accumulator + currentValue, 0);

        const couponName = req.params.couponName;
        const couponFound = await Coupon.findOne({couponName})
        const usedCoupon = await Coupon.find({couponName, usedUsers: { $in: [user] } })
        if(couponFound.lastDate < currentDate){
            res.json({message:'Coupon Expired'})
        }
        else if(couponFound && usedCoupon.length ==0){
            if(totalAmound < couponFound.minimumPurchase){
                res.json({message:'Less amount to apply'})
            }
            else{
                await Cart.findOneAndUpdate({user},{$set:{couponApplied:couponName}})
                totalAmound = totalAmound - couponFound.maximumDiscount
                res.json({message:'Coupon applied',maxDiscount:couponFound.maximumDiscount,totalAmound})
            }
        }
        else{
            res.json({message:'Invalid coupon'})
        }
    } catch (error) {
        next(error)
    }
}


exports.couponRemove = async (req,res,next) =>{
    try {
        const user_id = req.session.user_id;
        await Cart.findOneAndUpdate({user:user_id},{$set:{couponApplied:''}});
        res.redirect('/cart')
    } catch (error) {
        next(error)
    }
}