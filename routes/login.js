var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var con = require('../lib/connection.js');

router.get('/', function (req, res, next) {
    var currentUser = 0;
    var currentRole = 0;
    if (req.user !== undefined){
        currentUser = req.user.user_id;
        currentRole = req.user.user_role_id;
    }
    console.log(currentUser);

    res.render('login', {currentUser: currentUser, currentRole: currentRole, message: req.flash('message')});
});

// router.post('/', function (req, res) {
//
//     //получаем из БД юзера с логином, который пришел из запроса
//     var query = "SELECT * FROM `user` WHERE `user_login` = '" + req.body.login + "'";
//
//     con.query(query, function (err, result) {
//         if (err) throw err;
//
//         //проверяем пароль
//         bcrypt.compare(req.body.password, result[0].user_password).then(function (checkPass) {
//           if(checkPass){
//               res.redirect('/');
//           }
//           else {
//               res.redirect('/login');
//           }
//         });
//     });
// });

module.exports = router;