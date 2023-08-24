const multer = require('multer');

//image upload multer
const storage = multer.diskStorage({
    destination:'public/images/',
    filename : (req,file,cb) =>{
        // cb(null,Date.now(+file+originalname));
        cb(null, file.originalname)
    }
})

exports.upload = multer({
    storage:storage
})