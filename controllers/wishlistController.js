const Product = require('../models/productModel');
const Wishlist = require('../models/wishlistModel');
const Cart = require('../models/cartModel');
const Category = require('../models/categoryModel');

//wishlist GET
exports.wishlist = async (req,res,next) =>{
    try {
        const user_id = req.session.user_id;

        //cart items count
        const cart = await Cart.findOne({user:user_id})
        let cartItems
        if(user_id && cart){
            cartItems = cart.product.length
        }
        

        const category = await Category.find()
        let wishlist = await Wishlist.findOne({user:user_id}).populate({
            path: 'product.product_id',
            model: 'Product', // Replace with the actual model name for Product
            populate: {
              path: 'category', // Path to the category reference inside the Product schema
              model: 'Category', // Replace with the actual model name for Category
            }})
            wishlist = wishlist || []
        res.render('user/wishlist',{wishlist,category,cartItems,title:'Wishlist'})
    } catch (error) {
        next(error)
    }
}


//wishlist POST
exports.addToWishlist = async(req,res,next) =>{
    try {
        const product_id = req.params.product_id
        const user_id = req.session.user_id
        
        if(!user_id){
            res.json({success:'login'})
        }
        else{
            const userFound = await Wishlist.findOne({user:user_id})
            if(!userFound){
                const newWishlist = new Wishlist({
                    user:user_id,
                    product:[{product_id}]
                })
                await newWishlist.save()
            }
            else{
                await Wishlist.updateOne({user:user_id},{$push:{product:{product_id}}})
            }
            res.json({})
       }
        
    } catch (error) {
        next(error)
    }
}


//remove product from wishlist
exports.removeFromWishlist = async (req,res) =>{
    try {
        const user_id = req.session.user_id;
        const product_id = req.params.product_id
        await Wishlist.findOneAndUpdate(
            {user: user_id },
            { $pull: { product: { _id: product_id } } })

        res.redirect('/wishlist')

    } catch (error) {
        console.log(error.message);
    }
}


//move to bag from wishlist
exports.moveToBag = async (req,res) =>{
    try {
        const user_id = req.session.user_id;
        const product_id = req.params.product_id;


        await Wishlist.findOneAndUpdate(
            {user: user_id },
            { $pull: { product: { _id: product_id } } })
    } catch (error) {
        console.log(error.message);
    }
}