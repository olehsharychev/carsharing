var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var con = require('../lib/connection.js');

const saltRounds = 10;

router.get('/', function (req, res, next) {
    res.render('registration');
});

router.post('/', function (req, res) {
    if (!req.body) return res.sendStatus(400);

    //получаем хеш пароля
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        if (err) throw err;

        //записываем роль, логин и хеш пароля в БД
        var query = "INSERT INTO `user` (`user_id`, `user_role_id`, `user_login`, `user_password`) VALUES "
            + "(NULL, '" + req.body['role[]'] + "', '" + req.body.login + "', '" + hash +"');";

        con.query(query, function (err) {
            if (err) throw err;
        });
    });

    res.redirect('/cars');
});

module.exports = router;
