const Review = require('../models/reviewModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');

//review page GET
exports.productReviews = async (req,res,next) =>{
    try {
        const category =await Category.find({})

        const user_id = req.session.user_id;

        //cart items count
        const cart = await Cart.findOne({user:user_id})
        let cartItems
        if(user_id && cart){
            cartItems = cart.product.length
        }

        const product_id = req.params.product_id;
        
        const product = await Product.findById(product_id);
        
        //checking user reviewed the product or not
        let reviewFound = await Review.findOne({ product_id, 'reviews.user_id': user_id })
        if(reviewFound == null){
            reviewFound = undefined
        }
        
        
        //reviews for showing 
        let reviews = await Review.find({product_id},{ reviews: { $elemMatch: { user_id: { $ne: user_id } } } }).populate('reviews.user_id')
        
        //average rating finding
        let reviewss = await Review.find({product_id},{reviews:1})
        reviewss = reviewss[0]?.reviews || [];

        let totalRating = 0;
        
        const numReviews = reviewss.length;
        
        for (const review of reviewss) {
            totalRating += review.rating;
        }
        
        const averageRating = numReviews > 0 ? totalRating / numReviews : 0;

        if(reviews[0] == undefined){
            reviews = undefined
        }
        else{
            reviews = reviews[0].reviews
        }
        
        //checking the product is bought by the user
        const orders = await Order.exists({
            "user": user_id,
            "orders": {
              $elemMatch: {
                "product": product_id,
                "orderStatus": 4
              }
            }
        });
        
        res.render('products/reviews',{category,product,orders,reviews,reviewFound,numReviews,averageRating,cartItems,title:'Reviews'});

    } catch (error) {
        next(error)
    }
}



//user adding review POST
exports.newReview = async (req,res) =>{
    try {
        const {selectedValue,title,description} = req.body;
        const product_id = req.params.product_id;
        const user_id = req.session.user_id

        //checking if any one review is there or not
        const reviews = await Review.findOne({product_id})

        //checking user is already reviewed the product
        const userReviewFound = await Review.exists({
            "product_id": product_id,
            "reviews": {
              $elemMatch: {
                "user_id": user_id,
              }
            }
        });


        if(!reviews){
            const newReview = new Review ({
                product_id,
                reviews:[{
                    user_id,
                    rating:selectedValue,
                    title,
                    review:description,
                    date: new Date()
                }]
            })
            await newReview.save()
        }
        else if(reviews && userReviewFound){
            const updatedReview = await Review.findOneAndUpdate(
                { product_id, 'reviews.user_id': user_id },
                {
                  $set: {
                    'reviews.$.rating': selectedValue,
                    'reviews.$.title': title,
                    'reviews.$.review': description,
                    'reviews.$.date': new Date()
                  }
                },
                { new: true }
              );
        }
        else if(reviews){
            await Review.updateOne({product_id},{$push:{reviews:{
                user_id,
                rating:selectedValue,
                title,
                review:description,
                date: new Date()
            }}})
        }
        res.redirect(`/product/reviews/${product_id}`)


    } catch (error) {
        console.log(error.message);
    }
}