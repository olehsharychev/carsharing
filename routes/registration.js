var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var con = require('../connect/connection.js');

var carsList;

// con.query("SELECT * FROM test_table", function (err, result, fields) {
//     if (err) throw err;
//     console.log(result);
//     carsList = result;
// });

router.get('/', function (req, res, next) {
    res.render('registration');
});

router.post('/', function (req, res) {
    if (!req.body) return res.sendStatus(400);
    console.log(req.body.login);
    var query = "INSERT INTO `user` (`user_id`, `user_role`, `user_login`, `user_password`) VALUES "
                + "(NULL, 'renter', '" + req.body.login + "', '1111');";
    console.log(query);
    con.query(query, function (err) {
        if (err) throw err;
    });
    res.redirect('/cars');
});

module.exports = router;
