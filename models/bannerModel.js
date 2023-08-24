const mongoose = require('mongoose');

const banners = new mongoose.Schema({
    images:{
        type:Array,
        maxItems:4
    }
})

module.exports = mongoose.model('Banner',banners);