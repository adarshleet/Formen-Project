const Admin = require('../models/adminModel');
const User = require('../models/userModel');
const Order = require('../models/orderModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const bcrypt = require('bcrypt');

//USER MANAGEMENT
//admin login get
exports.adminLoginPage = async (req, res) => {
    try {
        var context = req.app.locals.specialContext;
        req.app.locals.specialContext = null;
        res.render('admin/login', { context, title: 'Admin Login' })
    } catch (error) {
        console.log(error.message);
    }
}

//admin login post
exports.adminlogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });

        //admin check
        if (!admin) {
            req.app.locals.specialContext = 'Invalid admin credentials';
            res.redirect('/admin')
        }

        //admin password check
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (isPasswordValid) {
            req.session.admin_id = admin._id;
            res.redirect('/admin/dashboard')
        }
        else {
            // res.status(500).json({error:'invalid email and password'});
            req.app.locals.specialContext = 'Invalid admin credentials';
            res.redirect('/admin')
        }
    }
    catch (error) {
        console.log(error);
    }
}


//admin dashboard get
exports.dashboard = async (req, res) => {
    try {
        //count all users
        const usersCount = await User.find({}).countDocuments();

        //recent users
        const recentUsers = await User.count({
            $expr: {
                $eq: [{ $month: "$joinedDate" }, new Date().getMonth() + 1]
            }
        });

        //blocked users
        const blockedUsers = await User.count({
            isBlocked: true
        });



        //count of all orders
        let ordersCount = await Order.aggregate([
            {
                $match: {
                    "orders.orderStatus": 4
                }
            },
            {
                $count: "totalCount"
            }
        ])
        ordersCount = ordersCount[0]?.totalCount || 0

        //recent orders
        let recentOrders = await Order.aggregate([
            {
                $unwind: "$orders" // Unwind the orders array
            },
            {
                $match: {
                    "orders.orderStatus": 4,
                    $expr: {
                        $eq: [{ $month: "$orders.orderDate" }, new Date().getMonth() + 1]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalCount: { $sum: 1 }
                }
            }
        ]);

        recentOrders = recentOrders[0]?.totalCount || 0

        //returns and cancellations
        let returnCount = await Order.aggregate([
            {
                $match: {
                    "orders.orderStatus": { $gt: 4 }
                }
            },
            {
                $count: "totalCount"
            }
        ])
        returnCount = returnCount[0]?.totalCount || 0

        //total sales
        //price used calculate
        let totalPrice = await Order.aggregate([
            {
                $match: {
                    "orders.orderStatus": 4
                }
            },
            {
                $unwind: "$orders" // Unwind the orders array
            },
            {
                $match: {
                    "orders.orderStatus": 4
                }
            },
            {
                $group: {
                    _id: null,
                    totalPrice: { $sum: "$orders.price" }
                }
            }
        ])
        totalPrice = totalPrice[0]?.totalPrice || 0

        //wallet used calculate
        let walletUsed = await Order.aggregate([
            {
                $match: {
                    "orders.orderStatus": 4
                }
            },
            {
                $unwind: "$orders" // Unwind the orders array
            },
            {
                $match: {
                    "orders.orderStatus": 4
                }
            },
            {
                $group: {
                    _id: null,
                    totalWalletUsed: { $sum: "$orders.walletUsed" }
                }
            }
        ])
        walletUsed = walletUsed[0]?.totalWalletUsed || 0
        const totalSales = walletUsed + totalPrice

        //total profit find
        let totalCost = await Order.aggregate([
            {
                $match: {
                    "orders.orderStatus": 4
                }
            },
            {
                $unwind: "$orders" // Unwind the orders array
            },
            {
                $match: {
                    "orders.orderStatus": 4
                }
            },
            {
                $group: {
                    _id: null,
                    totalCost: { $sum: "$orders.cost" }
                }
            }
        ])
        totalCost = totalCost[0]?.totalCost || 0
        const totalProfit = totalSales - totalCost

        //total refunds calculate
        let totalRefund = await Order.aggregate([
            {
                $match: {
                    "orders.orderStatus": { $gt: 4 },
                    $or: [
                        { "orders.paymentMethode": "Prepaid" },
                        { "orders.paymentMethode": "Debited from wallet" }
                    ]
                }
            },
            {
                $unwind: "$orders" // Unwind the orders array
            },
            {
                $match: {
                    "orders.orderStatus": { $gt: 4 },
                    $or: [
                        { "orders.paymentMethode": "Prepaid" },
                        { "orders.paymentMethode": "Debited from wallet" }
                    ]
                }
            },
            {
                $group: {
                    _id: null,
                    totalRefund: { $sum: "$orders.price" }
                }
            }
        ]);
        totalRefund = totalRefund[0]?.totalRefund || 0


        //CATEGORY WISE SALES
        //jeans sales count
        let jeansOrdersCount = await Order.aggregate([
            {
                $match: {
                    "orders.orderStatus": 4,
                    "orders.category": 'jeans'
                }
            },
            {
                $count: "totalCount"
            }
        ])
        jeansOrdersCount = jeansOrdersCount[0]?.totalCount || 0

        //jeans sales amount
        let totalPriceJeans = await Order.aggregate([
            {
                $match: {
                    "orders.orderStatus": 4,
                    "orders.category": 'jeans'
                }
            },
            {
                $unwind: "$orders" // Unwind the orders array
            },
            {
                $match: {
                    "orders.orderStatus": 4,
                    "orders.category": 'jeans'
                }
            },
            {
                $group: {
                    _id: null,
                    totalPrice: { $sum: "$orders.price" }
                }
            }
        ])
        totalPriceJeans = totalPriceJeans[0]?.totalPrice || 0

        //wallet used calculate
        let walletUsedJeans = await Order.aggregate([
            {
                $match: {
                    "orders.orderStatus": 4,
                    "orders.category": 'jeans'
                }
            },
            {
                $unwind: "$orders" // Unwind the orders array
            },
            {
                $match: {
                    "orders.orderStatus": 4,
                    "orders.category": 'jeans'
                }
            },
            {
                $group: {
                    _id: null,
                    totalWalletUsed: { $sum: "$orders.walletUsed" }
                }
            }
        ])
        walletUsedJeans = walletUsedJeans[0]?.totalWalletUsed || 0
        const totalSalesJeans = walletUsedJeans + totalPriceJeans



        //shirts sales count
        let shirtsOrdersCount = await Order.aggregate([
            {
                $match: {
                    "orders.orderStatus": 4,
                    "orders.category": 'shirt'
                }
            },
            {
                $count: "totalCount"
            }
        ])
        shirtsOrdersCount = shirtsOrdersCount[0]?.totalCount || 0



        //shirts sales amount
        let totalPriceShirt = await Order.aggregate([
            {
                $match: {
                    "orders.orderStatus": 4,
                    "orders.category": 'shirt'
                }
            },
            {
                $unwind: "$orders" // Unwind the orders array
            },
            {
                $match: {
                    "orders.orderStatus": 4,
                    "orders.category": 'shirt'
                }
            },
            {
                $group: {
                    _id: null,
                    totalPrice: { $sum: "$orders.price" }
                }
            }
        ])
        totalPriceShirt = totalPriceShirt[0]?.totalPrice || 0


        //wallet used calculate shirt
        let walletUsedShirt = await Order.aggregate([
            {
                $match: {
                    "orders.orderStatus": 4,
                    "orders.category": 'shirt'
                }
            },
            {
                $unwind: "$orders" // Unwind the orders array
            },
            {
                $match: {
                    "orders.orderStatus": 4,
                    "orders.category": 'shirt'
                }
            },
            {
                $group: {
                    _id: null,
                    totalWalletUsed: { $sum: "$orders.walletUsed" }
                }
            }
        ])
        walletUsedShirt = walletUsedShirt[0]?.totalWalletUsed || 0
        const totalSalesShirt = walletUsedShirt + totalPriceShirt



        //t-shirts sales count
        let tShirtsOrdersCount = await Order.aggregate([
            {
                $match: {
                    "orders.orderStatus": 4,
                    "orders.category": 't-shirt'
                }
            },
            {
                $count: "totalCount"
            }
        ])
        tShirtsOrdersCount = tShirtsOrdersCount[0]?.totalCount || 0;



        //t-shirts sales amount
        let totalPriceTShirt = await Order.aggregate([
            {
                $match: {
                    "orders.orderStatus": 4,
                    "orders.category": 't-shirt'
                }
            },
            {
                $unwind: "$orders" // Unwind the orders array
            },
            {
                $match: {
                    "orders.orderStatus": 4,
                    "orders.category": 't-shirt'
                }
            },
            {
                $group: {
                    _id: null,
                    totalPrice: { $sum: "$orders.price" }
                }
            }
        ])
        totalPriceTShirt = totalPriceTShirt[0]?.totalPrice || 0


        //wallet used calculate t-shirt
        let walletUsedTShirt = await Order.aggregate([
            {
                $match: {
                    "orders.orderStatus": 4,
                    "orders.category": 't-shirt'
                }
            },
            {
                $unwind: "$orders" // Unwind the orders array
            },
            {
                $match: {
                    "orders.orderStatus": 4,
                    "orders.category": 't-shirt'
                }
            },
            {
                $group: {
                    _id: null,
                    totalWalletUsed: { $sum: "$orders.walletUsed" }
                }
            }
        ])
        walletUsedTShirt = walletUsedTShirt[0]?.totalWalletUsed || 0
        const totalSalesTShirt = walletUsedTShirt + totalPriceTShirt



        //cap sales count
        let capOrdersCount = await Order.aggregate([
            {
                $match: {
                    "orders.orderStatus": 4,
                    "orders.category": 'cap'
                }
            },
            {
                $count: "totalCount"
            }
        ])
        capOrdersCount = capOrdersCount[0]?.totalCount || 0;

        //cap sales amount
        let totalPriceCap = await Order.aggregate([
            {
                $match: {
                    "orders.orderStatus": 4,
                    "orders.category": 'cap'
                }
            },
            {
                $unwind: "$orders" // Unwind the orders array
            },
            {
                $match: {
                    "orders.orderStatus": 4,
                    "orders.category": 'cap'
                }
            },
            {
                $group: {
                    _id: null,
                    totalPrice: { $sum: "$orders.price" }
                }
            }
        ])
        totalPriceCap = totalPriceCap[0]?.totalPrice || 0

        //wallet used calculate cap
        let walletUsedCap = await Order.aggregate([
            {
                $match: {
                    "orders.orderStatus": 4,
                    "orders.category": 'cap'
                }
            },
            {
                $unwind: "$orders" // Unwind the orders array
            },
            {
                $match: {
                    "orders.orderStatus": 4,
                    "orders.category": 'cap'
                }
            },
            {
                $group: {
                    _id: null,
                    totalWalletUsed: { $sum: "$orders.walletUsed" }
                }
            }
        ])
        walletUsedCap = walletUsedCap[0]?.totalWalletUsed || 0
        const totalSalesCap = walletUsedCap + totalPriceCap

        //PRODUCT DETAILS
        //all products
        const productsCount = await Product.find({}).countDocuments();

        let stockCount = await Product.aggregate([
            {
                $group: {
                    _id: null,
                    totalStock: { $sum: "$stock" }
                }
            }
        ])
        stockCount = stockCount[0]?.totalStock || 0

        //JEANS 
        //jeans count

        const jeans_id = await Category.findOne({ category: 'jeans' }, { _id: 1 })
        let jeansCount = 0, jeansStockCount = 0
        if (jeans_id) {
            jeansCount = await Product.find({ category: jeans_id._id }).countDocuments();

            jeansStockCount = await Product.aggregate([
                {
                    $match: { category: jeans_id._id }
                },
                {
                    $group: {
                        _id: null,
                        totalStock: { $sum: "$stock" }
                    }
                }
            ]);
            jeansStockCount = jeansStockCount[0]?.totalStock || 0
        }

        //SHIRTS 
        //shirts count

        const shirt_id = await Category.findOne({ category: 'shirt' }, { _id: 1 })
        let shirtCount = 0, shirtStockCount = 0
        if (shirt_id) {
            shirtCount = await Product.find({ category: shirt_id._id }).countDocuments();

            shirtStockCount = await Product.aggregate([
                {
                    $match: { category: shirt_id._id }
                },
                {
                    $group: {
                        _id: null,
                        totalStock: { $sum: "$stock" }
                    }
                }
            ]);
            shirtStockCount = shirtStockCount[0]?.totalStock || 0
        }




        //T-SHIRTS 
        //t-shirts count
        const tShirt_id = await Category.findOne({ category: 't-shirt' }, { _id: 1 })
        let tShirtCount = 0, tShirtStockCount = 0
        if (tShirt_id) {
            tShirtCount = await Product.find({ category: tShirt_id._id }).countDocuments();

            tShirtStockCount = await Product.aggregate([
                {
                    $match: { category: tShirt_id._id }
                },
                {
                    $group: {
                        _id: null,
                        totalStock: { $sum: "$stock" }
                    }
                }
            ]);
            tShirtStockCount = tShirtStockCount[0]?.totalStock || 0

        }

        //CAPS
        //caps count
        const cap_id = await Category.findOne({ category: 'cap' }, { _id: 1 })
        let capCount = 0, capStockCount = 0
        if (cap_id) {
            capCount = await Product.find({ category: cap_id._id }).countDocuments();

            capStockCount = await Product.aggregate([
                {
                    $match: { category: cap_id._id }
                },
                {
                    $group: {
                        _id: null,
                        totalStock: { $sum: "$stock" }
                    }
                }
            ]);
            capStockCount = capStockCount[0]?.totalStock || 0

        }


        //BAR GRAPH SETUP
        const bars = await Order.aggregate([
            {
                $unwind: "$orders"
            },
            {
                $match: {
                    "orders.orderStatus": 4
                }
            },
            {
                $addFields: {
                    orderMonth: { $month: "$orders.orderDate" }
                }
            },
            {
                $group: {
                    _id: {
                        month: "$orderMonth",
                        year: { $year: "$orders.orderDate" }
                    },

                    totalPrice: { $sum: "$orders.price" },
                    totalWallet: { $sum: "$orders.walletUsed" },
                    totalCost: { $sum: "$orders.cost" }
                }
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1
                }
            }
        ])


        yearToFilter = parseInt(req.query.year) || 2023
        const filteredData = bars.filter(entry => entry._id.year === yearToFilter);


        //PAYMENT METHOD USAGE
        //prepaid
        let prepaid = await Order.aggregate([
            {
                $match: {
                    "orders.orderStatus": 4,
                    "orders.paymentMethode": 'Prepaid'
                }
            },
            {
                $unwind: "$orders" // Unwind the orders array
            },
            {
                $match: {
                    "orders.orderStatus": 4,
                    "orders.paymentMethode": 'Prepaid'
                }
            },
            {
                $group: {
                    _id: null,
                    prepaid: { $sum: "$orders.price" }
                }
            }
        ])

        prepaid = prepaid[0]?.prepaid || 0

        //cash on delivery
        let cashOnDelivery = await Order.aggregate([
            {
                $match: {
                    "orders.orderStatus": 4,
                    "orders.paymentMethode": 'Cash on delivery'
                }
            },
            {
                $unwind: "$orders" // Unwind the orders array
            },
            {
                $match: {
                    "orders.orderStatus": 4,
                    "orders.paymentMethode": 'Cash on delivery'
                }
            },
            {
                $group: {
                    _id: null,
                    cash: { $sum: "$orders.price" }
                }
            }
        ])
        cashOnDelivery = cashOnDelivery[0]?.cash || 0


        //wallet
        let wallet = await Order.aggregate([
            {
                $match: {
                    "orders.orderStatus": 4
                }
            },
            {
                $unwind: "$orders" // Unwind the orders array
            },
            {
                $match: {
                    "orders.orderStatus": 4
                }
            },
            {
                $group: {
                    _id: null,
                    wallet: { $sum: "$orders.walletUsed" }
                }
            }
        ])

        wallet = wallet[0]?.wallet || 0



        res.render('admin/dashboard', {
            usersCount,
            recentUsers,
            blockedUsers,
            ordersCount,
            recentOrders,
            returnCount,
            totalSales,
            totalProfit,
            totalRefund,
            jeansOrdersCount,
            totalSalesJeans,
            shirtsOrdersCount,
            totalSalesShirt,
            tShirtsOrdersCount,
            totalSalesTShirt,
            capOrdersCount,
            totalSalesCap,
            productsCount,
            stockCount,
            jeansCount, jeansStockCount,
            shirtCount, shirtStockCount,
            tShirtCount, tShirtStockCount,
            capCount, capStockCount,
            filteredData,
            cashOnDelivery, prepaid, wallet,
            title: 'Dashboard'
        })
    } catch (error) {
        console.log(error.message);
    }
}



//Sales report page 
exports.salesReport = async (req, res, next) => {
    try {

        //sales report
        let startDate;
        if (req.body.startDate) {
            startDate = new Date(req.body.startDate);
        } else {
            startDate = new Date("2023-07-01");
        }

        let endDate;
        if (req.body.endDate) {
            endDate = new Date(req.body.endDate);
        } else {
            endDate = new Date();
        }


        const sales = await Order.aggregate([
            {
                $match: {
                    "orders.orderStatus": 4,
                    "orders.orderDate": {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $unwind: "$orders"
            },
            {
                $lookup: {
                    from: "users", // Replace with the actual name of the user collection
                    localField: "user",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                $addFields: {
                    paymentMethod: "$orders.paymentMethode",
                    userName: { $arrayElemAt: ["$userDetails.name", 0] },
                    amount: { $add: ["$orders.price", "$orders.walletUsed"] },
                    date: "$orders.orderDate",
                    category: "$orders.category"
                }
            },
            {
                $project: {
                    _id: "$_id", // Use the main document's _id as orderId
                    paymentMethod: 1,
                    userName: 1,
                    amount: 1,
                    date: 1,
                    category: 1
                }
            }
        ]);

        res.render('admin/salesReport.ejs', { sales, startDate, endDate, title: 'Sales Report' })
    } catch (error) {
        next(error)
    }
}




//view all users for admin
exports.allUsers = async (req, res) => {
    try {
        var context = req.app.locals.specialContext;
        req.app.locals.specialContext = null;

        var search = '';
        if (req.query.search) {
            search = req.query.search;
        }

        var page = 1;
        if (req.query.page) {
            page = req.query.page;
        }

        const limit = 8

        const allUsers = await User.find({
            name: { $regex: '^' + search, $options: 'i' }
        })
            .limit(limit * 1)
            .skip((page - 1) * limit)

        const usersCount = await User.find({
            name: { $regex: '^' + search, $options: 'i' }
        }).countDocuments()


        res.render('admin/users', {
            users: allUsers, context,
            totalPages: Math.ceil(usersCount / limit),
            currentPage: page,
            limit,
            usersCount,
            title: 'All Users'
        });
    } catch (error) {
        console.log(error.message);
    }
}


//block a user
exports.blockUser = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById({ _id: id });
        if (user.isBlocked === false) {
            await User.findByIdAndUpdate(id, { $set: { isBlocked: true } })
            req.app.locals.specialContext = 'Blocked the user';
        }
        else {
            await User.findByIdAndUpdate(id, { $set: { isBlocked: false } });
            req.app.locals.specialContext = 'Unblocked the user';
        }
        res.redirect('/admin/users')
    } catch (error) {
        console.log(error.message);
    }
}


//order management page get
exports.orderManagement = async (req, res) => {
    try {
        var page = 1;
        if (req.query.page) {
            page = req.query.page;
        }

        const limit = 5


        const orders = await Order.find().populate('user').populate('orders.product').sort({ 'orders.orderDate': -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)

        // orders.reverse();

        const orderCount = await Order.find().populate('user').populate('orders.product').countDocuments()

        res.render('admin/orderDetails', {
            orders,
            totalPages: Math.ceil(orderCount / limit),
            currentPage: page,
            limit,
            orderCount,
            title: 'Order Management'
        });
    } catch (error) {
        console.log(error.message);
    }
}


//change order status in admin panel
exports.changeOrderStatus = async (req, res) => {
    try {
        const actioDo = req.query.actionDo
        const order_id = req.query.order_id;
        await Order.findOneAndUpdate({
            'orders._id': order_id,
        },
            {
                $set: {
                    'orders.$.orderStatus': actioDo,
                },
            })
        res.redirect('/admin/orderManagement')
    } catch (error) {
        console.log(error.message);
    }
}

//admin logout
exports.adminLogout = async (req, res) => {
    try {
        req.session.destroy()
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message);
    }
}





