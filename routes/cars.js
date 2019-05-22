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

        // подсчет непрочитанных сообщений
        var unreadMessagesQuery = `SELECT COUNT(message_unread) AS amount_unread FROM message WHERE 
                                   message_unread = 1 
                                   AND 
                                   message_recipient_id = ${currentUser}`;
        con.query(unreadMessagesQuery, function (err, amountUnread) {
            if (err) throw err;
            res.render('cars', {
                adList: adList,
                currentUser: currentUser,
                currentRole: currentRole,
                amountUnread: amountUnread[0].amount_unread
            });
        });
    });
});

router.get('/search', function (req, res, next) {
    console.log(req.query);

    if(req.query.searchPriceFrom == ''){
        req.query.searchPriceFrom = 0;
    }
    if(req.query.searchPriceTo == ''){
        req.query.searchPriceTo = 99999999999;
    }
    if(req.query.searchEngineFrom == ''){
        req.query.searchEngineFrom = 0;
    }
    if(req.query.searchEngineTo == ''){
        req.query.searchEngineTo = 99999999999;
    }
    if(req.query.searchPowerFrom == ''){
        req.query.searchPowerFrom = 0;
    }
    if(req.query.searchPowerTo == ''){
        req.query.searchPowerTo = 99999999999;
    }
    if(req.query.searchYearFrom == ''){
        req.query.searchYearFrom = 0;
    }
    if(req.query.searchYearTo == ''){
        req.query.searchYearTo = 9999;
    }
    if(req.query.searchMileageFrom == ''){
        req.query.searchMileageFrom = 0;
    }
    if(req.query.searchMileageTo == ''){
        req.query.searchMileageTo = 99999999999;
    }

    var searchQuery = `SELECT * FROM ad, image WHERE 
                       ad.ad_id = image.ad_id
                       AND
                       ad.ad_tittle LIKE '%${req.query.searchTitle}%'
                       AND
                       ad.car_brand LIKE '%${req.query.searchBrand}%'
                       AND
                       ad.car_model LIKE '%${req.query.searchModel}%'
                       AND
                       ad.car_transmission LIKE '%${req.query.searchTransmission}%'
                       AND
                       (ad.ad_price >= ${req.query.searchPriceFrom} AND ad.ad_price <= ${req.query.searchPriceTo})
                       AND
                       (ad.car_engine >= ${req.query.searchEngineFrom} AND ad.car_engine <= ${req.query.searchEngineTo})
                       AND
                       (ad.car_power >= ${req.query.searchPowerFrom} AND ad.car_power <= ${req.query.searchPowerTo})
                       AND
                       (ad.car_year >= ${req.query.searchYearFrom} AND ad.car_year <= ${req.query.searchYearTo})
                       AND
                       (ad.car_mileage >= ${req.query.searchMileageFrom} AND ad.car_mileage <= ${req.query.searchMileageTo})
                       GROUP BY ad.ad_id`;

    con.query(searchQuery, function (err, result) {
        if (err) throw err;
        var currentUser = 0;
        var currentRole = 0;
        if (req.user !== undefined){
            currentUser = req.user.user_id;
            currentRole = req.user.user_role_id;
        }
        var unreadMessagesQuery = `SELECT COUNT(message_unread) AS amount_unread FROM message WHERE 
                                   message_unread = 1 
                                   AND 
                                   message_recipient_id = ${currentUser}`;
        con.query(unreadMessagesQuery, function (err, amountUnread) {
            if (err) throw err;
            res.render('cars', {
                adList: result,
                currentUser: currentUser,
                currentRole: currentRole,
                amountUnread: amountUnread[0].amount_unread
            });
        });
    });
});

module.exports = router;
