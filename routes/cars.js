var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var con = require('../connect/connection.js');

var carsList;

con.query("SELECT * FROM ad", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    carsList = result;
});

router.get('/', function(req, res, next) {
    res.render('cars', {carsList: carsList});
    console.log(carsList);
});

module.exports = router;
