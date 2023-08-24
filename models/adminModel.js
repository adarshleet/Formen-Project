const mongoose = require('mongoose');

//admin schema
const admin = new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
});

const Admin = mongoose.model('Admin',admin);

module.exports = Admin;