const mongoose = require('mongoose');

const dbConnect = ()=>{
    try{
        mongoose.connect(process.env.MONGODB_URL,{ useNewUrlParser: true, useUnifiedTopology: true });
        console.log("connected to database");
    }
    catch(error){
        console.log(error.message);
    }
}

module.exports = dbConnect;