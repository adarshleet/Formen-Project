const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const Review = require('../models/reviewModel');
const Wishlist  = require('../models/wishlistModel');
const Cart = require('../models/cartModel');



//ADMIN PRODUCT MANAGEMENT
//category page get
exports.category = async (req,res,next) =>{
    try {
        const category = await Category.find({})
        res.render('admin/category',{category,title : 'Category'})
    } catch (error) {
        next(error)
    }
}

//edit category
exports.editCategory = async (req,res) =>{
    try {
        const category = req.body.category
        const categoryId = req.body.categoryId
        await Category.findByIdAndUpdate({_id:categoryId},{$set:{category}})
        res.redirect('/admin/category')
    } catch (error) {
        console.log(error.message);
    }
}

//hide category
exports.hideCategory =  async (req,res,next) =>{
    try {
        const categoryId = req.params.categoryId;
        const category = await Category.findById({_id:categoryId});
        if(category.showStatus == true){
            await Category.findByIdAndUpdate({_id:categoryId},{$set:{showStatus:false}})
        }
        else{
            await Category.findByIdAndUpdate({_id:categoryId},{$set:{showStatus:true}})
        }
        res.redirect('/admin/category')

    } catch (error) {
        next(error)
    }
}


//add category
exports.addCategory = async (req,res) =>{
    try {
        const {category} = req.body;
        const existingCategory = await Category.findOne({category})
        if(existingCategory){
            req.app.locals.specialContext = 'Existing category';
        }
        else{
            const newCategory = new Category({
                category
            });
            await newCategory.save();
            req.app.locals.specialContext = 'New category added';
        }
        res.redirect('/admin/products')
    } catch (error) {
        console.log(error.message);
    }
}


//add brands of a category
exports.addBrand = async (req,res) =>{
    try {
        const {category , brand} = req.body;
        const categoryCheck = await Category.findOne({category});
        if(categoryCheck){
            if(brand){
                const existingBrand = await Category.findOne({ category, brand: { $in: [brand] } });
                if(existingBrand){
                    req.app.locals.specialContext = 'Existing Brand';
                }
                else{
                    req.app.locals.specialContext = 'New Brand added';
                    await Category.updateMany({},{$addToSet:{brand:brand}});
                }
            }
            else{
                req.app.locals.specialContext = 'Enter valid details';
            }
        }
        res.redirect('/admin/products')
    } catch (error) {
        console.log(error.message);
    }
}

//add sizes of a category
exports.addSize = async (req,res) =>{
    try {
        const {category , size} = req.body;
        const categoryCheck = await Category.findOne({category});
        if(categoryCheck){
            if(size){
                const existingSize = await Category.findOne({ category, size: { $in: [size] } });
                if(existingSize){
                    req.app.locals.specialContext = 'Existing Size';
                }
                else{
                    req.app.locals.specialContext = 'New Size added';
                    const categoryGot = await Category.findOne({category})
                    categoryGot.size.addToSet(size)
                    categoryGot.size.sort((a,b)=>a-b)
                    await categoryGot.save();
                    // await Category.updateOne({category},{$addToSet:{size:size}});
                }
            }
            else{
                req.app.locals.specialContext = 'Enter valid details';
            }
        }
        res.redirect('/admin/products')
    } catch (error) {
        console.log(error.message);
    }
}


//add new product GET
exports.editProduct = async (req,res) =>{
    try {
        const itemToEdit = req.params.id;
        const products = await Product.findById(itemToEdit).populate('category');
        const category = await Category.find({});
        res.render('admin/editProduct',{products,category,title:'Edit Product Details'});
    } catch (error) {
        console.log(error.message);
    }
}


//update product POST
exports.updateProduct = async (req,res) =>{
    try {
        const {id,name,category,brand,size,cost,actualPrice,sellingPrice,stock,description} = req.body;
        const images = req.files;
        const categoryCheck = await Category.findById(req.body.category);
        if(!categoryCheck){
            req.app.locals.specialContext = 'Invalid category';
        }
        const brandCheck = await Category.findOne({ _id: category, brand: { $in: [brand] } });
        const sizeCheck = await Category.findOne({ _id: category, size: { $in: [size] } });
        if(!brandCheck || !sizeCheck){
            req.app.locals.specialContext = 'Invalid details';
        }
        else{
            const updateProduct = new Product ({
                name,
                category,
                brand,
                size,
                cost,
                actualPrice,
                sellingPrice,
                stock,
                description
            });
            res.redirect('/admin/products')
            await Product.updateOne(
                { _id: id },
                {
                    $push: { images: { $each: images } },
                    $set: {
                    name,
                    category,
                    brand,
                    size,
                    cost,
                    actualPrice,
                    sellingPrice,
                    stock,
                    description
                    }
                }
            );
            req.app.locals.specialContext = 'Product details updated';
        }
        res.redirect('/admin/products') 
    } catch (error) {
        console.log(error.message);
    }
}


//add a new product POST
exports.addProduct = async (req,res) =>{
    try {
        const {name,category,brand,size,cost,actualPrice,sellingPrice,stock,description} = req.body;
        const images = req.files;
        const categoryCheck = await Category.findById(req.body.category);
        const existingProduct = await Product.findOne({name:name})
        if(existingProduct){
            req.app.locals.specialContext = 'existing product. Please update what you needed';
        }
        else{
            if(!categoryCheck){
            req.app.locals.specialContext = 'Invalid details';
        }
        const brandCheck = await Category.findOne({ _id: category, brand: { $in: [brand] } });
        const sizeCheck = await Category.findOne({ _id: category, size: { $in: [size] } })
        if(!brandCheck || !sizeCheck){
            req.app.locals.specialContext = 'Invalid details';
        }
        else{
            const newProduct = new Product ({
                name,
                category,
                brand,
                size,
                cost,
                actualPrice,
                sellingPrice,
                stock,
                description,
                images,
                addedDate : new Date()
            });
            req.app.locals.specialContext = 'New product added';
            await newProduct.save();
        }
        }
        res.redirect('/admin/products');
    } catch (error) {
        console.log(error.message);
    }
}


//hide product
exports.hideProduct = async (req,res,next) =>{
    try {
        const id = req.params.id;
        const product = await Product.findById(id)
        if(product.show_status === true){
            await Product.findByIdAndUpdate(id,{$set:{show_status:false}})
            req.app.locals.specialContext = 'Product visibility changed to - HIDDEN';
        }
        else{
            await Product.findByIdAndUpdate(id,{$set:{show_status:true}})
            req.app.locals.specialContext = 'Product visibility changed to - SHOW';
        }
        res.redirect('/admin/products')
    } catch (error) {
        next(error)
    }
}


//view all products
exports.viewProducts = async (req,res,next) =>{
    try {

        var context = req.app.locals.specialContext;
        req.app.locals.specialContext = null;


        var search = '';
        if(req.query.search){
            search = req.query.search;
        }

        var page = 1;
        if(req.query.page){
            page = req.query.page;
        }

        const limit = 5

        const products = await Product.find({
            name:{$regex: '^'+search,$options:'i'}
        }).populate('category')
        .limit(limit*1)
        .skip((page-1)*limit)

        const productCount = await Product.find({
            name:{$regex: '^'+search,$options:'i'}
        }).countDocuments()

        const category = await Category.find({});

        res.render('admin/products',{
            products,
            category,
            context,
            totalPages: Math.ceil(productCount/limit),
            currentPage:page,
            limit,
            productCount,
            title:'All Products'
        })
    } catch (error) {
        next(error)
    }
}

//select brand for adding product instant refresh of brand
exports.selectBrand = async (req, res) => {
    // Extract the query parameter
    const selectedValue = req.query.selectedValue;
    const brand = await Category.findById(selectedValue);
    // Perform any necessary logic based on the selected value
    // and generate the appropriate response
  
    // Send the response
    res.json(brand);
};


//delete product image
exports.deleteImage = async (req,res) =>{
    try {
        const id = req.query.id;
        const filename = req.query.filename;
        const product = await Product.findById(id);
        await Product.updateOne({_id:id},{$pull: { images: { filename } }});
        res.redirect(`/admin/products/edit_Product/${id}`)
    } catch (error) {
        console.log(error.message);
    }
}




//USER SIDE PRODUCTS VIEWING
// all products viewing - shop
exports.allProducts = async (req,res,next) =>{
    try {
        const category = await Category.find({})
        const user_id = req.session.user_id

        //cart items count
        const cart = await Cart.findOne({user:user_id})
        let cartItems
        if(user_id && cart){
            cartItems = cart.product.length
        }
        
        //taking wishlisted items id as strings
        let productIdsAsString = []
        const wishlisted = await Wishlist.findOne({user:user_id})
        if(user_id && wishlisted){
            productIdsAsString = wishlisted.product.map(item => item.product_id.toString());
        }

        //taking category to an array for filters
        let categoryToArray =await Category.aggregate([
            { $project: { _id: 0, category: 1 } },
            { $group: { _id: null, category: { $push: '$category' } } }
          ])
        categoryToArray = categoryToArray[0].category;

        let brands = await Category.findOne({},{brand:1})
        let brandsToArray = brands.brand

        const page = req.query.page || 1;
        const limit = 8
        const search = req.query.search || ""
        let sort = req.query.sort || {name:1}
        let cat = req.query.category || 'all'
        let price = req.query.price
        brands = req.query.brand || 'all'
        
        //brands setting up
        let brandsToFront
        brands === 'all' ?(brands = brandsToArray ,brandsToFront = '' ) : (brands = brands , brandsToFront = brands);
        brands = brands.map(brands => new RegExp(brands,'i'))

        //category setting up
        let categoryToFront
        cat === 'all' ?(cat = [...categoryToArray],categoryToFront = '') : (cat = cat ,categoryToFront=cat);
        const categoryNeed = await Category.find({category:{$in:cat}},{_id:1});
        const categoryStrings = categoryNeed.map(category => category._id.toString());

        //price setting up 
        if(price == 500){
            minPrice = 0
            maxPrice = price
        }
        else if(price == 2501){
            minPrice = price
            maxPrice = 0
        }
        else if(price == undefined){
            minPrice = 0
            maxPrice = 999999
        }
        else{
            if(typeof price === 'string'){
                minPrice = price - 499
                maxPrice = price
            }
            else{
                maxPrice = Math.max(...price);
                minPrice = Math.min(...price) - 499;
            }
        }

        price == undefined ? (price = '') : (price = price)

        //sort setting up
        let sortToFront = sort

        if(sort == 1){
            sort = {sellingPrice:1}
        }
        else if( sort == -1){
            sort = {sellingPrice:-1}
        }

        const products = await Product.find({
            category:categoryStrings,
            brand:brands,
            sellingPrice:{$gt: minPrice, $lt: maxPrice},
            show_status:true,
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } }
            ]
        })
        .limit(limit*1)
        .skip((page-1)*limit)
        .sort(sort)

        const productsCount = await Product.find({
            category:categoryStrings,
            brand:brands,
            sellingPrice:{$gt: minPrice, $lt: maxPrice},
            show_status:true,
            name:{$regex: ''+search,$options:'i'}
        }).countDocuments()

        res.render('products/shop',{products,category,search,brandsToFront,categoryToFront,price,sortToFront,
            productsCount,
            totalPages: Math.ceil(productsCount/limit),
            limit,
            page,
            productIdsAsString,
            title : 'Shop',
            cartItems
        });  
    } catch (error) {
        next(error)
    }
}


//single product view
exports.singleProduct = async (req,res,next) =>{
    try {
        const user_id = req.session.user_id

        //cart items count
        const cart = await Cart.findOne({user:user_id})
        let cartItems
        if(user_id && cart){
            cartItems = cart.product.length
        }

        const id = req.query.id;
        const product = await Product.findById(id).populate('category');
        const category = await Category.find({});

        //taking ratings for showing single product page
        //average rating finding
        let reviewss = await Review.find({product_id:id},{ reviews:1})
        let averageRating,numReviews
        if(reviewss.length != 0){
        
            reviewss = reviewss[0].reviews

            let totalRating = 0;
            numReviews = reviewss.length;

            for (const review of reviewss) {
            totalRating += review.rating;
            }

            averageRating = numReviews > 0 ? totalRating / numReviews : 0;
        }


        
        //taking wishlisted items id as strings
        let productIdsAsString = []
        const wishlisted = await Wishlist.findOne({user:user_id})
        if(user_id && wishlisted){
            productIdsAsString = wishlisted.product.map(item => item.product_id.toString());
        }

        //for warning
        var context = req.app.locals.specialContext;
        req.app.locals.specialContext = null;


        //siimilar items
        const similarItems = await Product.find({category:product.category._id,show_status:true}).sort({addedDate:-1}).limit(8)


        res.render('products/singleProduct',{product,category,context,productIdsAsString,averageRating,numReviews,similarItems,cartItems,title:'Product'});
    } catch (error) {
        next(error)
    }
}