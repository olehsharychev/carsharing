var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var con = require('../lib/connection.js');
var authentication = require('../lib/authentication');

router.get('/:user_id', authentication, function (req, res, next) {
    
    var query = `SELECT * FROM user WHERE user_id = ${req.params.user_id};
                 SELECT * FROM ad, image WHERE 
                 ad.ad_id = image.ad_id
                 AND
                 ad.ad_author_id = ${req.params.user_id}
                 GROUP BY ad.ad_id;`;
    con.query(query, function (err, result) {
        if (err) throw err;
        console.log(result);
        res.render('user-profile', {user: result});
    });
});

router.get('/vote-rating-plus/:user_id', authentication, function (req, res, next) {


});


module.exports = router;
