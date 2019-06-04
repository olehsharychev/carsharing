var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var con = require('../lib/connection.js');
var multer  = require('multer');
var fs = require('fs');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/user_photos/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname)
    }
});

var upload = multer({ storage: storage });

router.get('/', function (req, res, next) {
    var currentUser = 0;
    var currentRole = 0;
    if (req.user !== undefined){
        currentUser = req.user.user_id;
        currentRole = req.user.user_role_id;
    }
    console.log(currentUser);
    res.render('registration', {currentUser: currentUser, currentRole: currentRole, message: req.flash('message')});
});

router.post('/register', upload.single('userPhoto'), function (req, res) {
    if (!req.body) return res.sendStatus(400);

    // проверка на уникальность логина
    var selectUser = `SELECT * FROM user WHERE user_login = '${req.body.login}'`;
    con.query(selectUser, function (err, result) {
        if (err) throw err;

        if (result.length != 0){
            fs.unlink(`public/uploads/user_photos/${req.file.filename}`, function (err) {
                if(err) throw err;
            });
            req.flash('message', 'Такое имя пользователя уже используется!');
            res.redirect('/registration');
        }

        else {
            function getHash(password){
                var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';
                salt = salt + '' + password;
                var encPassword = crypto.createHash('sha1').update(salt).digest('hex');
                return encPassword;
            }

            var query = `INSERT INTO user VALUES 
                (NULL, 
                ${req.body.role}, 
                '${req.body.login}',
                '${getHash(req.body.password)}',
                '${req.file.filename}',
                '${req.body.firstName}',
                '${req.body.surname}',
                '${req.body.email}',
                '${req.body.telnum}',
                '${req.body.cardnum}',
                0)`;

            console.log(query);
            con.query(query, function (err) {
                if (err) throw err;
                res.redirect('/cars');
            });

        }
    });
});

module.exports = router;
