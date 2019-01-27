var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var con = require('../lib/connection.js');
var authentication = require('../lib/authentication');

router.get('/', authentication, function(req, res, next) {


    con.query(`SELECT * FROM ad, image WHERE ad.ad_id = image.ad_id GROUP BY ad.ad_id`, function (err, result, fields) {
        if (err) throw err;
        var adList = result;
        console.log(adList);
        res.render('cars', {adList: adList});
    });
});

module.exports = router;
