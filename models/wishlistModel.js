const mongoose = require('mongoose');

const wishlist = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    product:[{
        product_id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Product'
        }
    }]
})

module.exports = mongoose.model('Wishlist',wishlist)