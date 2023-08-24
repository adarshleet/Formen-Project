const mongoose = require('mongoose');

const order = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    orders:[{
        product:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Product'
        },
        count:{
            type:Number
        },
        size:{
            type:String
        },
        price:{
            type:Number
        },
        cost:{
            type:Number
        },
        category:{
            type:String
        },
        address:{
            type:Object
        },
        paymentMethode:{
            type:String
        },
        orderDate: {
            type: Date,
            default: Date.now,
        },
        orderStatus:{
            type:Number,
            default:1
        },
        walletUsed:{
            type:Number,
            default:0
        }
    }],
    couponUsed:{
        type:String
    }
})

module.exports = mongoose.model('Order',order);