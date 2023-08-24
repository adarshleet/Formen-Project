const mongoose = require('mongoose');

const cart = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    product:[{
        product_id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        count:{
            type:Number,
            default:1
        },
        size:{
            type:String
        },
        price:{
            type:Number
        }
    }],
    couponApplied:{
        type:String
    }
})

module.exports = mongoose.model('Cart',cart);