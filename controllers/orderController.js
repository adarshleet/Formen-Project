const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const Address = require('../models/addressModel');
const Coupon = require('../models/couponModel');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { now } = require('mongoose');

const razorpayKeyId = process.env.KEY_ID_RAZORPAY;
const razorpayKeySecret = process.env.KEY_SECRET_RAZORPAY;
var instance = new Razorpay({ key_id: razorpayKeyId, key_secret: razorpayKeySecret })


//payment for order GET
exports.payment = async (req,res,next) =>{
    try {
        const user = req.session.user_id;
        const userFound = await User.findById(user)

        const address_id = req.session.selectedAddress;
        const getCart = await Cart.findOne({user}).populate('product.product_id');
        const cart = getCart.product;
        let totalMRP = 0,discount = 0,totalAmound = 0,couponDiscount=0,walletUsed=0
        totalMRP += cart.map(item => item.product_id.actualPrice*item.count).reduce((accumulator, currentValue)=>accumulator + currentValue, 0);
        totalAmound += cart.map(item => item.product_id.sellingPrice*item.count).reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        discount = totalAmound - totalMRP;

        //checking coupon is applied
        const couponFound = await Coupon.findOne({couponName:getCart.couponApplied})
        if(couponFound){
            totalAmound = totalAmound - couponFound.maximumDiscount
            couponDiscount = couponFound.maximumDiscount
        }

        const totAmound = totalAmound

        //checking wallet is used
        if(userFound.walletApplied ==true){
            totalAmound = totalAmound - userFound.wallet
            if(totalAmound<0){
                totalAmound = 0
            }
            walletUsed=userFound.wallet
            if(userFound.wallet > totAmound){
                walletUsed = totAmound
            }
        }
        

        //for showing warning
        var context = req.app.locals.specialContext;
        req.app.locals.specialContext = null;

        res.render('user/payment',{userFound,totalMRP,totalAmound,discount,couponDiscount,totAmound,walletUsed,title:'Payment'})
    } catch (error) {
        next(error)
    }
}


//wallet amount applying
exports.applyWallet = async (req,res) =>{
    try {
        const user_id = req.session.user_id;
        const user = await User.findById(user_id);

        //apply or remove
        const toDo = req.params.toDo

        //wallet amount
        const walletAmount = user.wallet;

        if(toDo == 'USE'){
            //finding total amound
            const getCart = await Cart.findOne({user}).populate('product.product_id');
            const cart = getCart.product;
            let totalAmount = 0,couponDiscount=0
            totalAmount += cart.map(item => item.product_id.sellingPrice*item.count).reduce((accumulator, currentValue) => accumulator + currentValue, 0);

            //checking coupon is applied
            const couponFound = await Coupon.findOne({couponName:getCart.couponApplied})
            if(couponFound){
                totalAmount = totalAmount - couponFound.maximumDiscount
                couponDiscount = couponFound.maximumDiscount
            }

            await User.findByIdAndUpdate(user_id,{$set:{walletApplied:true}});
            res.json({success:true,message:'wallet applied',totalAmount,walletAmount})
        }
        else if(toDo == 'REMOVE'){
            await User.findByIdAndUpdate(user_id,{$set:{walletApplied:false}});
            res.json({success:false,message:'wallet removed'});
        }

    } catch (error) {
        console.log(error.message);
    }
}




//payment for order POST
exports.paymentDone = async (req,res) =>{
    try {
        const method = req.body;
        const user = req.session.user_id;
        const gotUser = await User.findById(user)

        const getCart = await Cart.findOne({user}).populate('product.product_id');
        const cart = getCart.product;
        let totalAmound = 0,discountForOne=0,walletAmountForOne=0,walletBalance=0,walletAmount=0
        totalAmound += cart.map(item => item.product_id.sellingPrice*item.count).reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        
        //checking coupon is applied
        const couponFound = await Coupon.findOne({couponName:getCart.couponApplied});
        if(couponFound){
            totalAmound = totalAmound - couponFound.maximumDiscount
            discountForOne = Math.round(couponFound.maximumDiscount/cart.length);
            await Coupon.findOneAndUpdate({couponName:getCart.couponApplied},{$addToSet:{usedUsers:user}});
        }

        //checking wallet is used
        if(gotUser.walletApplied === true){
            //calculating wallet balance for payment with wallet
            if(totalAmound<gotUser.wallet){
                walletBalance = gotUser.wallet - totalAmound
            }


            //total amound calculating
            totalAmound = totalAmound - gotUser.wallet

            //wallet amount for one product
            walletAmount = gotUser.wallet
        }

        if(!method.payment){
            req.app.locals.specialContext = 'Use a payment method';
            res.redirect('/payment');
        }
        else{
            const address_id = req.session.selectedAddress;
            const address = await Address.findOne({user:user},{address:{$elemMatch:{_id:address_id}}});
            const userFound = await Order.findOne({ user })
            const cart = await Cart.findOne({user})
            const cartForCost = await Cart.findOne({ user })
            .populate({
              path: 'product.product_id',
              populate: {
                path: 'category'
              }
            });

            if(method.payment === 'cash'){
                let orderArray=[]
                for(let i=0;i<cart.product.length;i++){

                    if(walletAmount>0){
                        if(walletAmount > (cart.product[i].price * cart.product[i].count)-discountForOne){
                            walletAmountForOne = (cart.product[i].price * cart.product[i].count)-discountForOne
                            walletAmount = walletAmount - (cart.product[i].price * cart.product[i].count)-discountForOne
                        }
                        else if(walletAmount < (cart.product[i].price * cart.product[i].count)-discountForOne && walletAmount >=0){
                            walletAmountForOne = walletAmount
                            walletAmount = 0
                        }
                        else{
                            walletAmountForOne = 0
                            walletAmount = 0
                        }
                   }

                    let order =  {  product : cart.product[i].product_id,
                                    count: cart.product[i].count,
                                    size: cart.product[i].size,
                                    price: (cart.product[i].price * cart.product[i].count)-discountForOne,
                                    cost: cartForCost.product[i].product_id.cost * cart.product[i].count,
                                    category : cartForCost.product[i].product_id.category.category,
                                    address: address.address[0],
                                    paymentMethode:'Cash on delivery',
                                    walletUsed:walletAmountForOne
                                }
                    orderArray.push(order)
                }
                const newOrder = new Order ({
                    user,
                    orders:orderArray,
                    couponUsed:getCart.couponApplied,
                })
                await newOrder.save();

                //reducing the stock
                let product='',count=0
                for(let i=0;i<cart.product.length;i++){
                    product = ((cart.product[i].product_id).toString())
                    count = cart.product[i].count
                    await Product.findByIdAndUpdate({_id:product},{$inc:{stock:-count}})
                }

                //making cart empty and coupon empty
                await Cart.findOneAndUpdate({user},{$set:{product:[],couponApplied:''}});

                //update wallet balance
                if(gotUser.walletApplied === true){
                    await User.findByIdAndUpdate(user,{$set:{wallet:0,walletApplied:false},
                        $push:{
                            walletHistory:{
                                transactionType: 'Product Purchase',
                                method:'Debit',
                                amount: gotUser.wallet,
                                date: Date.now()
                            }
                        }
                    });
                }

                res.json({status:'COD'});
            }
            else if(method.payment === 'online'){
                let orderArray=[]
                console.log(walletAmount);
                for(let i=0;i<cart.product.length;i++){
                if(walletAmount>0){
                    console.log("herealso",walletAmount);
                    console.log("herealso",walletAmount);
                    if(walletAmount > (cart.product[i].price * cart.product[i].count)-discountForOne){
                        walletAmountForOne = (cart.product[i].price * cart.product[i].count)-discountForOne
                        walletAmount = walletAmount - (cart.product[i].price * cart.product[i].count)-discountForOne
                        console.log(walletAmountForOne);
                    }
                    else if(walletAmount < (cart.product[i].price * cart.product[i].count)-discountForOne && walletAmount >=0){
                        walletAmountForOne = walletAmount
                        console.log(walletAmountForOne);
                        walletAmount = 0
                    }
                    else{
                        walletAmountForOne = 0
                        walletAmount = 0
                    }
               }
                    let order =  {  product : cart.product[i].product_id,
                                    count: cart.product[i].count,
                                    size: cart.product[i].size,
                                    price: (cart.product[i].price * cart.product[i].count)-discountForOne,
                                    cost: cartForCost.product[i].product_id.cost * cart.product[i].count,
                                    address: address.address[0],
                                    paymentMethode:'Prepaid',
                                    walletUsed: walletAmountForOne 
                                }
                    orderArray.push(order)
                }
                const newOrder = new Order ({
                    user,
                    orders:orderArray,
                    couponUsed:getCart.couponApplied,
                })

                var options = {
                    amount: totalAmound * 100,
                    currency: "INR",
                    receipt: " "
                }
                instance.orders.create(options, (err, order) => {
                    if (err) {
                        console.log(err);
                    } else {   
                        res.json({ status: 'ONLINE', order: order,newOrder });
                    }
                })
            }
            else if(method.payment === 'wallet'){
                //making the orders seperate using for loop
                let orderArray=[]
                for(let i=0;i<cart.product.length;i++){
                    let order =  {  product : cart.product[i].product_id,
                                    count: cart.product[i].count,
                                    size: cart.product[i].size,
                                    price: 0,
                                    cost: cartForCost.product[i].product_id.cost * cart.product[i].count,
                                    address: address.address[0],
                                    paymentMethode:'Debited from wallet',
                                    walletUsed:(cart.product[i].price * cart.product[i].count)-discountForOne
                                }
                    orderArray.push(order)
                }
                const newOrder = new Order ({
                    user,
                    orders:orderArray,
                    couponUsed:getCart.couponApplied,
                })
                await newOrder.save();

                //reducing the stock
                let product='',count=0
                for(let i=0;i<cart.product.length;i++){
                    product = ((cart.product[i].product_id).toString())
                    count = cart.product[i].count
                    await Product.findByIdAndUpdate({_id:product},{$inc:{stock:-count}})
                }

                //setting the cart empty and removing the coupon if it is applied
                await Cart.findOneAndUpdate({user},{$set:{product:[],couponApplied:''}});

                //update wallet balance
                await User.findByIdAndUpdate(user,{$set:{wallet:walletBalance,walletApplied:false},
                    $push:{
                        walletHistory:{
                            transactionType: 'Product Purchase',
                            method:'Debit',
                            amount: gotUser.wallet - walletBalance,
                            date: Date.now()
                        }
                    }
                });

                // res.redirect('/orderSuccess')
                res.json({status:'WALLET'});
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}


//razorpay payment verify
exports.verifyPayment = async (req,res) =>{
    try {
        const user_id = req.session.user_id
        const user = await User.findById(user_id)

        const payment = req.body.payment;

        //the order details from razorpay
        const order = req.body.order;

        //full order details for saving after payment
        const newOrder = req.body.newOrder;

        //verifying the payment is confirmed or not
        let hmac = crypto.createHmac('sha256', razorpayKeySecret);
        hmac.update(payment.razorpay_order_id +'|'+payment.razorpay_payment_id);

        hmac=hmac.digest('hex');

        if(hmac == payment.razorpay_signature){
            new Order(newOrder).save()

            //reducing the stock
            const cart = await Cart.findOne({user:user_id});
            let product='',count=0
            for(let i=0;i<cart.product.length;i++){
                product = ((cart.product[i].product_id).toString())
                count = cart.product[i].count
                await Product.findByIdAndUpdate({_id:product},{$inc:{stock:-count}})
            }

            //setting cart empty
            await Cart.findOneAndUpdate({user},{$set:{product:[],couponApplied:''}});

            //wallet settting up if used
            const gotUser = await User.findById(user)
            if(gotUser.walletApplied === true){
                await User.findByIdAndUpdate(user,{$set:{wallet:0,walletApplied:false},
                    $push:{
                        walletHistory:{
                            transactionType: 'Product Purchase',
                            method:'Debit',
                            amount: gotUser.wallet,
                            date: Date.now()
                        }
                    }
                });
            }

            res.json({paymentSuccess:true})
        }
        else{
            res.json({paymentSuccess:false})
        }
    } catch (error) {
        console.log(error.message);
    }
}


//cancel Order by user
exports.cancelOrder = async(req,res) =>{
    try {
        const user_id = req.session.user_id
        const order_id = req.params.order_id;
        const order = await Order.findOne(
            {
              user: user_id,
              'orders._id': order_id,
            },
            { 'orders.$': 1 }
          ).populate('orders.product')
        
        
        await Order.findOneAndUpdate({
            user: user_id,
            'orders._id': order_id,
          },
          {
            $set: {
              'orders.$.orderStatus': 5,
              'orders.$.orderDate': Date.now()
            },
        });

        //restock the items || increasing the stock
        let product = ((order.orders[0].product._id)).toString()
        let productCount = order.orders[0].count
        await Product.findByIdAndUpdate({_id:product},{$inc:{stock: productCount}});
        
        //wallet amount returning
        if(order.orders[0].paymentMethode == 'Prepaid' && order.orders[0].walletUsed > 0){
            const priceToWallet = order.orders[0].price + order.orders[0].walletUsed;
            await User.findByIdAndUpdate(user_id,{$inc:{wallet:priceToWallet},
                $push:{
                    walletHistory:{
                        transactionType: 'Product Cancellation',
                        method:'Credit',
                        amount: priceToWallet,
                        date: Date.now()
                    }
                }
            },{upsert:true});
        }

        else if((order.orders[0].paymentMethode == 'Cash on delivery' || order.orders[0].paymentMethode == 'Debited from wallet') && order.orders[0].walletUsed > 0){
            const priceToWallet = order.orders[0].walletUsed;
            await User.findByIdAndUpdate(user_id,{$inc:{wallet:priceToWallet},
                $push:{
                    walletHistory:{
                        transactionType: 'Product Cancellation',
                        method:'Credit',
                        amount: priceToWallet,
                        date: Date.now()
                    }
                }
            },{upsert:true});
        }
        
        res.redirect('/orders&returns')
    } catch (error) {
        console.log(error.message);
    }
}


//order placed
exports.orderPlaced = async(req,res,next) =>{
    try {
        //cart items count
        const user_id = req.session.user_id;
        const cart = await Cart.findOne({user:user_id})
        let cartItems
        if(user_id && cart){
            cartItems = cart.product.length
        }

        res.render('user/orderPlaced',{title:'Order Success',cartItems});
    } catch (error) {
        next(error)
    }
}