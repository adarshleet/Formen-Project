const User = require('../models/userModel');
const Address = require('../models/addressModel');
const Cart = require('../models/cartModel');
const Coupon = require('../models/couponModel');


//address selection in checkout
exports.addressSelection = async (req, res, next) => {
    try {
        const user = req.session.user_id;
        const address = await Address.findOne({ user })
        const getCart = await Cart.findOne({ user }).populate('product.product_id');
        const cart = getCart.product
        let totalMRP = 0, discount = 0, totalAmound = 0, couponDiscount = 0
        totalMRP += cart.map(item => item.product_id.actualPrice * item.count).reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        totalAmound += cart.map(item => item.product_id.sellingPrice * item.count).reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        discount = totalAmound - totalMRP;

        //checking coupon is applied
        const couponFound = await Coupon.findOne({ couponName: getCart.couponApplied })
        if (couponFound) {
            totalAmound = totalAmound - couponFound.maximumDiscount
            couponDiscount = couponFound.maximumDiscount
        }

        res.render('user/addressInCart', { totalMRP, totalAmound, discount, address, couponDiscount, title: 'Select Address' });
    } catch (error) {
        next(error)
    }
}


//add new address GET
exports.addNewAddress = async (req, res, next) => {
    try {
        res.render('user/addNewAddress', { title: 'Add New Address' });
    } catch (error) {
        next(error)
    }
}



//add new address POST
exports.addAddress = async (req, res) => {
    try {
        const user = req.session.user_id;
        const { name, mobile, address, locality, pincode, district, state } = req.body;
        const userFound = await Address.findOne({ user: user })
        if (!userFound) {
            const newAddress = new Address({
                user,
                address: [{ name, mobile, address, locality, pincode, district, state }]
            })
            await newAddress.save();
            res.redirect('/address')
        }
        else {
            await Address.findOneAndUpdate({ user }, { $push: { address: { name, mobile, address, locality, pincode, district, state } } });
            res.redirect('/address')
        }
    } catch (error) {
        console.log(error.message);
    }
}


//remove an address
exports.removeAddress = async (req, res) => {
    try {
        const address = req.params.address_id;
        const user = req.session.user_id;
        await Address.findOneAndUpdate(
            { user: user },
            { $pull: { address: { _id: address } } })
        res.redirect('/address');
    } catch (error) {
        console.log(error.message);
    }
}


//edit address GET
exports.editAddress = async (req, res, next) => {
    try {
        const user = req.session.user_id;
        const address_id = req.params.address_id;
        const address = await Address.findOne({ user }, { address: { $elemMatch: { _id: address_id } } });
        res.render('user/editAddress', { address: address.address[0], title: 'Edit Address' });
    } catch (error) {
        next(error)
    }
}



//edit address POST
exports.editAnAddress = async (req, res) => {
    try {
        const address_id = req.body.id;
        const user = req.session.user_id;
        const { name, mobile, address, locality, pincode, district, state } = req.body;
        await Address.findOneAndUpdate({ user: user, 'address._id': address_id }, { $set: { "address.$": { name, mobile, address, locality, pincode, district, state } } });
        res.redirect('/address');
    } catch (error) {
        console.log(error.message);
    }
}


//selected address for order POST
exports.addressSelected = async (req, res) => {
    try {
        const user = req.session.user_id;
        const address = req.body.address;
        if (!address) {
            res.redirect('/address');
        }
        req.session.selectedAddress = address
        res.redirect('/payment')
    } catch (error) {
        console.log(error.message);
    }
}


