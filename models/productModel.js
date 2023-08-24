const mongoose = require('mongoose');

const products = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    },
    brand: {
        type:String,
        required:true
    },
    size:{
        type:String,
        required:true
    },
    cost: {
        type: Number,
    },
    actualPrice:{
        type:Number
    },
    sellingPrice:{
        type:Number
    },
    stock:{
        type:Number
    },
    description:{
        type:String
    },
    addedDate:{
        type: Date
    },   
    images:{
        type:Array,
        maxItems: 4
    },
    show_status:{
        type: Boolean,
        default:true
    }
});

module.exports = mongoose.model('Product',products)