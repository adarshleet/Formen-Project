const Banner = require('../models/bannerModel');

exports.viewBanners = async (req,res) =>{
    try {
        const banner = await Banner.findOne({})
        res.render('admin/banners',{banner,title:'Banners'})
    } catch (error) {
        console.log(error.message);
    }
}


//change banner images
exports.bannerUpdate = async (req,res) =>{
    try {
        const banners = req.files
        await Banner.updateOne({},{$push:{images:{$each:banners}}},{upsert:true})
        res.redirect('/admin/banners')
    } catch (error) {
        console.log(error.message);
    }
}

//delete banner
exports.deleteBanner = async (req,res) =>{
    try {
        const filename = req.params.filename;
        await Banner.updateOne({},{$pull: { images: { filename } }});
        res.redirect('/admin/banners')
    } catch (error) {
        console.log(error.message);
    }
}