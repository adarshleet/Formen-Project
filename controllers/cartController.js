const User = require('../models/userModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Coupon = require('../models/couponModel');

//cart GET
exports.cart = async(req,res,next) => {
    try {
        const user = req.session.user_id;
        //for warning message
        

        //cart finding for total calculation
        const getCart = await Cart.findOne({user}).populate('product.product_id');
        const cart = getCart.product
        let totalMRP = 0,discount = 0,totalAmound = 0,couponDiscount=0,couponSelected
        totalMRP += cart.map(item => item.product_id.actualPrice*item.count).reduce((accumulator, currentValue)=>accumulator + currentValue, 0);
        totalAmound += cart.map(item => item.product_id.sellingPrice*item.count).reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        discount = totalAmound - totalMRP;

        //checking coupons that are not used
        const couponsToDisplay = await Coupon.find({ usedUsers: { $nin: [user] } })

        //checking coupon is applied
        const couponFound = await Coupon.findOne({couponName:getCart.couponApplied})
        if(couponFound && totalAmound > couponFound.minimumPurchase){
            totalAmound = totalAmound - couponFound.maximumDiscount;
            couponDiscount = couponFound.maximumDiscount;
            couponSelected = await Coupon.findOne({couponName:getCart.couponApplied});
        }

        res.render('user/cart',{cart,totalMRP,totalAmound,discount,couponDiscount,couponsToDisplay,couponSelected,title:'Cart'});
     
    } catch (error) {
        next(error)
    }
}

exports.addToCart = async(req,res) =>{
    const user = req.session.user_id;
    const product_id = req.params.prod_id;
    const size = req.body.selectedValue;

    try {    
        if (!user) {
            res.redirect('/login')
        } 
        else if (!size) {
            req.app.locals.specialContext = 'PLEASE SELECT A SIZE';
            res.redirect(`/product?id=${product_id}`);
        } 
        else {
            const product = await Product.findById(product_id)
            // Check if the user has an existing cart
            const userFound = await Cart.findOne({ user });

            if (!userFound) {
            // If the user doesn't have a cart, create a new cart with the selected product
            const newCart = new Cart({
                user,
                product: [{ product_id, count: 1, size ,price:product.sellingPrice}]
            });
            await newCart.save();
            req.app.locals.specialContext = 'PRODUCT ADDED TO BAG';
            res.redirect(`/product?id=${product_id}`);
            } 
            else {
                // Check if the selected product already exists in the user's cart
                const itemFound = userFound.product.find(
                    (item) => item.product_id.toString() === product_id && item.size === size);

                if (itemFound) {
                    const products = await Cart.find({user:user},{product:1})
                    let sum = 0;
                    for(let i=0;i<products[0].product.length;i++){
                        if(products[0].product[i].product_id.toString() === product_id){
                            sum+= products[0].product[i].count
                        }
                    }

                    const maxCount = await Cart.findOne({user:user},{product:{$elemMatch:{'product_id':product_id,'size':size}}});

                    const stock = await Product.findById(product_id,{stock:1});
                    if(sum > stock.stock){
                        req.app.locals.specialContext = 'STOCK EXCEEDED';
                        res.redirect(`/product?id=${product_id}`);
                    }
                    else if(maxCount.product[0].count >=5){
                        req.app.locals.specialContext = 'BAG SIZE LIMIT REACHED';
                        res.redirect(`/product?id=${product_id}`);
                    }
                    else{
                        // If the product exists in the cart, increment the count
                        await Cart.findOneAndUpdate({
                            user: user,
                            'product.product_id': product_id,
                            'product.size': size,
                        },
                        { $inc: { 'product.$.count': 1 } },
                        { new: true } // Return the updated cart document after the update
                        );
                        req.app.locals.specialContext = 'EXISTING PRODUCT ADDED ONE MORE';
                        res.redirect(`/product?id=${product_id}`);
                    }
                } 
                else {
                    // If the product is not in the cart, add it as a new item
                    await Cart.updateOne(
                        { user: user },
                        { $push: { product: { product_id, count: 1, size,price:product.sellingPrice } } }
                    );
                    req.app.locals.specialContext = 'PRODUCT ADDED TO BAG';
                    res.redirect(`/product?id=${product_id}`);
                }
            }
        }
    } 
    catch (error) {
        console.log(error.message);
    }
}



exports.changeCount = async (req,res) =>{
    try {
        const user = req.session.user_id;
        const cart_id = req.params.cart_id;
        const operationToDo = req.body.toDo;
        const cart = await Cart.findOne({ user: user, 'product._id': cart_id },{ 'product.$': 1 }).populate('product.product_id');
        const newCart = await Cart.findOne({ user: user, 'product._id': cart_id })
        
        const id  = cart.product[0].product_id._id;
        let sumOfCount = 0
        for(let i=0;i<newCart.product.length;i++){
            if(newCart.product[i].product_id.toString() === id.toString()){
                sumOfCount += newCart.product[i].count;
            }
        }
        let count = cart.product[0].count;
        const actual_price = cart.product[0].product_id.actualPrice;
        const selling_price = cart.product[0].product_id.sellingPrice;
        const stock = cart.product[0].product_id.stock;
        if(operationToDo === 'increase'){
            if(sumOfCount >= stock){
                res.json({status : 'stock',actual_price,selling_price,stock,count,sumOfCount})
            }
            else if(count >= 5){
                res.json({status:'bag',actual_price,selling_price,stock,count,sumOfCount})
            }
            else{
                await Cart.findOneAndUpdate({ user: user, 'product._id': cart_id },{ $inc: { 'product.$.count': 1 } });
                count = count + 1
                res.json({actual_price,selling_price,stock,count,sumOfCount})
            }
        }
        else if(operationToDo === 'decrease'){
            if(count <= 1){
                res.json({status:'min',actual_price,selling_price,stock,count,sumOfCount})
            }
            else{
                await Cart.findOneAndUpdate({ user: user, 'product._id': cart_id },{ $inc: { 'product.$.count': -1 } });
                count = count -1
                res.json({actual_price,selling_price,stock,count,sumOfCount})
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}


//remove product from cart
exports.removeProduct = async (req,res) =>{
    try {
        const cart = req.params.cart_id;
        const user = req.session.user_id;
        await Cart.findOneAndUpdate(
            {user: user },
            { $pull: { product: { _id: cart } } })
        res.redirect('/cart')
    } catch (error) {
        console.log(error.message);
    }
}



