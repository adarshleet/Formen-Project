const express = require('express');
const session = require('express-session');
const path = require('path');
const crypto = require('crypto');
const nocache = require('nocache');
const dotenv = require('dotenv').config();
const PORT = process.env.PORT || 4000;
const dbConnect = require('./config/dbConnect');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to prevent caching
app.use(nocache())

//create secret key for session middleware
const secretKey = crypto.randomBytes(32).toString('hex');

//configure session middleware
app.use(
    session({
        secret: secretKey,
        resave: false,
        saveUninitialized: true,
    })
);


//set view engine
app.set('view engine','ejs');
app.set('views',path.join(__dirname, 'views'));

//serving static files
app.use(express.static(path.join(__dirname,'public')));

//database connection
dbConnect();

//user route
const userRouter = require('./routes/userRoutes');
app.use('/',userRouter);

//admin route
const adminRouter = require('./routes/adminRoutes');
app.use('/admin',adminRouter);

app.use('/admin',(req,res)=>{
    res.send('404')
});

app.use((req,res)=>{
    res.render('user/404')
});

app.listen(PORT,()=>{
    console.log(`Server running on port http://localhost:${PORT}`);
});