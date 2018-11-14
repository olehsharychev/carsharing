var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var con = require('../lib/connection.js');
var authentication = require('../lib/authentication');

var carsList;

// con.query("SELECT * FROM ad", function (err, result, fields) {
//     if (err) throw err;
//     carsList = result;
// });

router.get('/', authentication, function(req, res, next) {
    con.query("SELECT * FROM ad", function (err, result, fields) {
        if (err) throw err;
        var carsList = result;
        res.render('cars', {carsList: carsList});
    });
});

module.exports = router;
