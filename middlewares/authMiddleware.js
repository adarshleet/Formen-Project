const User = require('../models/userModel');

 exports.isLoggedIn = async (req,res,next)=>{
    try{
        if(req.session.user_id){
            const user = await User.findById({_id:req.session.user_id})
            if(user.isBlocked == true){
                req.session.destroy()
                res.redirect('/login');
            }
            else{
                next();
            }
        }
        else{
            res.redirect('/login');
        }
    }
    catch(error){
        console.log('internal error'+error.message);
    }
 }


 exports.isLoggedOut = (req,res,next)=>{
    try{
        if(req.session.user_id){
            res.redirect('/')
        }
        else{
            next();
        }
    }
    catch(error){
        console.log(error.message);
    }

 }