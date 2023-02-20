//installed 3rd party packages
let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

//modules for authenticatioin
let session = require('express-session');
let passport = require('passport');
let passportLocal = require('passport-local');
let localStrategy = passportLocal.Strategy;
let flash = require('connect-flash');


//database setup
let mongoose = require('mongoose');
//let DB = "mongodb://127.0.0.1:27017/book_store"

let DB=require('./db')
mongoose.set('strictQuery', true);
mongoose.connect(DB.URI, {useNewUrlParser:true,useUnifiedTopology:true});

let mongoDB = mongoose.connection;
mongoDB.on('error', console.error.bind(console, 'Connection Error :'));

mongoDB.once('open',()=>{
  console.log('Connected to mongoDB....');
})

//middlewares from the routes folder
let indexRouter = require('../routes/index');
let usersRouter = require('../routes/users');
let aboutRouter = require('../routes/about');
let projectRouter = require('../routes/projects');
let servicesRouter = require('../routes/services');
let contactRouter = require('../routes/contact');
let booksRouter =  require('../routes/book');
let businessContactRouter =  require('../routes/businesscontact');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../../public')));
app.use(express.static(path.join(__dirname, '../../node_modules')));

//setup express session
app.use(session({
  secret: "SomeSecret",
  saveUninitialized: false,
  resave: false
}));

// initialize flash
app.use(flash());

// initialize passport
app.use(passport.initialize());
app.use(passport.session());


//passport user configuration


// create a User Model Instance
let userModel = require('../models/user');
let User = userModel.User;

//implement a User Authenticate Strategy
passport.use(User.createStrategy());


// serialize and deserialize the User info
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//routing requests to the appropriate route.
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/about', aboutRouter);
app.use('/projects', projectRouter);
app.use('/services', servicesRouter);
app.use('/contact',contactRouter);
app.use('/book-list',booksRouter);
app.use('/business-contact',businessContactRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', { title: 'Error'});
});

module.exports = app;