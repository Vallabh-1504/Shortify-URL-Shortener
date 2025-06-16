require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo');
const ejsMate = require('ejs-mate');
const AppError = require('./utilities/AppError');


// Routes
const urlRoutes = require('./routes/urlRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

const secret = process.env.SESSION_SECRET;
const PORT = process.env.PORT || 8001;
const dbUrl = process.env.MONGO_URL || "mongodb://localhost:27017/URLshortener"


mongoose.connect(dbUrl);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', ()=> {
    console.log('mongoose connected');
});


app.engine('ejs', ejsMate)

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


const sessionConfig = {
    secret: secret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({mongoUrl: dbUrl}),
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
};

app.use(session(sessionConfig))

app.use(flash());

app.locals.layout = 'layout/boilerplate';

app.use((req, res, next) =>{
    res.locals.userId = req.session.userId || null;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.info = req.flash('info');
    res.locals.loggedOutMsg = req.query.logout ? 'Successfully logged out' : null;
    res.locals.baseUrl = process.env.BASE_URL;
    next();
});

//Routes
app.use('/', authRoutes);
app.use('/', urlRoutes);


// 404 for any other route
app.all(/(.*)/, (req, res, next) =>{
    next(new AppError('Page not found', 404));
})

//error handler
app.use((err, req, res, next) =>{
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Oh no! Something went wrong.';
    res.status(statusCode).render('error', {err, title: 'error'});
});


app.listen(PORT, ()=> {
    console.log('server started');
});
