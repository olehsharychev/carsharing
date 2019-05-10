var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var con = require('../lib/connection.js');
var authentication = require('../lib/authentication');

router.get('/', function(req, res, next) {

    con.query(`SELECT * FROM ad, image WHERE ad.ad_id = image.ad_id GROUP BY ad.ad_id`, function (err, result, fields) {
        if (err) throw err;
        var adList = result;

        var currentUser = 0;
        var currentRole = 0;
        if (req.user !== undefined){
            currentUser = req.user.user_id;
            currentRole = req.user.user_role_id;
        }
        res.render('cars', {adList: adList, currentUser: currentUser, currentRole: currentRole});
    });
});

router.get('/search', function (req, res, next) {
    console.log(req.query);
    var searchQuery = `SELECT * FROM ad, image WHERE 
                       ad.ad_id = image.ad_id
                       AND
                       ad_tittle LIKE '%${req.query.searchData}%'
                       GROUP BY ad.ad_id`;
    con.query(searchQuery, function (err, result) {
        if (err) throw err;
        var currentUser = 0;
        var currentRole = 0;
        if (req.user !== undefined){
            currentUser = req.user.user_id;
            currentRole = req.user.user_role_id;
        }
        res.render('cars', {adList: result, currentUser: currentUser, currentRole: currentRole})
    });
});

module.exports = router;
