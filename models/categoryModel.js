const mongoose = require('mongoose');

const category = new mongoose.Schema({
    category:{
        type:String,
        unique:true,
    },
    brand:{
        type:Array
    },
    size:{
        type:Array
    },
    showStatus:{
        type: Boolean,
        default : true
    }
})

module.exports = mongoose.model('Category',category)