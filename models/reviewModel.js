const mongoose = require('mongoose');

const review = mongoose.Schema({
    product_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product'
    },
    reviews:[{
        user_id :{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        },
        rating:{
            type:Number
        },
        title:{
            type:String
        },
        review:{
            type:String
        },
        date:{
            type:Date
        }
    }]
})

module.exports = mongoose.model('review',review);

