var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sassMiddleware = require('node-sass-middleware');
var flash = require('connect-flash');
// var bcrypt = require('bcrypt');
var crypto = require('crypto');
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var connection = require('./lib/connection');
var session = require('express-session');
var store = require('express-session').Store;
var betterMemoryStore = require('session-memory-store')(session);
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var carsRouter = require('./routes/cars');
var createAdRouter = require('./routes/create-ad');
var registrationRouter = require('./routes/registration.js');
var loginRouter = require('./routes/login.js');
var viewCarRouter = require('./routes/view-car');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

var store = new betterMemoryStore({expires: 60 * 60 * 1000, debug: true});
app.use(session({
    name: 'JSESSION',
    secret: 'carsharing_secret',
    store: store,
    resave: true,
    saveUninitialized: true
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use('local', new localStrategy({

        usernameField: 'login',

        passwordField: 'password',

        passReqToCallback: true
    }, function (req, login, password, done) {


        if (!login || !password) {
            return done(null, false, req.flash('message', 'All fields are required.'));
        }

        var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';

        connection.query("select * from user where user_login = ?", [login], function (err, rows) {

            if (err) return done(req.flash('message', err));

            if (!rows.length) {
                return done(null, false, req.flash('message', 'Invalid username or password.'));
            }

            salt = salt + '' + password;

            var encPassword = crypto.createHash('sha1').update(salt).digest('hex');


            var dbPassword = rows[0].user_password;


            if (!(dbPassword == encPassword)) {
                console.log('error');
                return done(null, false, req.flash('message', 'Invalid username or password.'));

            }

            return done(null, rows[0]);

        });

    }
));
passport.serializeUser(function (user, done) {
    done(null, user.user_id);
});

passport.deserializeUser(function (id, done) {
    connection.query("select * from user where user_id = " + id, function (err, rows) {
        done(err, rows[0]);
    });
});

app.get('/login', function(req, res){
    res.render('login',{'message' :req.flash('message')});
});

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/cars');
});

app.post("/signin", passport.authenticate('local', {

    successRedirect: '/cars',

    failureRedirect: '/login',

    failureFlash: true

}), function(req, res, info){

    res.render('login',{'message' :req.flash('message')});
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/cars', carsRouter);
app.use('/create-ad', createAdRouter);
app.use('/create', createAdRouter);
app.use('/registration', registrationRouter);
app.use('/register', registrationRouter);
app.use('/cars/view-car', viewCarRouter);

// app.use('/login', loginRouter);
// app.use('/signin', loginRouter);

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
  res.render('error');
});

module.exports = app;
