var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var con = require('../lib/connection.js');
var authentication = require('../lib/authentication');

router.get('/:ad_id', authentication, function(req, res, next) {

    var adId = req.params.ad_id;
    con.query(`SELECT * FROM ad, image WHERE ad.ad_id = ${adId} AND image.ad_id = ${adId}`, function (err, result, fields) {
        if (err) throw err;
        var car = result;
        console.log(car);
        res.render('view-car', {car: car});
    });
});

module.exports = router;