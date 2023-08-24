const mongoose = require('mongoose')

const coupon = new mongoose.Schema({
    couponName:{
        type:String,
        unique:true
    },
    minimumPurchase:{
        type:Number
    },
    maximumDiscount:{
        type:Number
    },
    lastDate:{
        type:Date
    },
    showStatus:{
        type:Boolean,
        default:true
    },
    usedUsers:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
})

module.exports = mongoose.model('Coupon',coupon)