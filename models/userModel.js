const mongoose = require('mongoose');

const user = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    gender:{
        type: String,
    },
    mobile:{
        type: String,
        required: true
    },
    email:{
        type: String,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    joinedDate:{
        type : Date
    },
    referralCode:{
        type:String
    },
    wallet:{
        type:Number,
        default:0
    },
    walletApplied:{
        type:Boolean,
        default:false
    },
    walletHistory:[{
        transactionType: String,
        method: String,
        amount: Number,
        date: Date,
    }]    
});

const User = mongoose.model('User',user);

module.exports = User;