var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var con = require('../connect/connection.js');

router.get('/', function (req, res, next) {
    res.render('login');
});

router.post('/', function (req, res) {
    console.log(req.body);

    //получаем из БД юзера с логином, который пришел из запроса
    var query = "SELECT * FROM `user` WHERE `user_login` = '" + req.body.login + "'";
    con.query(query, function (err, result) {
        if (err) throw err;

        //проверяем пароль
        bcrypt.compare(req.body.password, result[0].user_password).then(function (checkPass) {
          if(checkPass){
              res.redirect('/');
          }
          else {
              res.redirect('/login');
          }
        });

    });
});

module.exports = router;