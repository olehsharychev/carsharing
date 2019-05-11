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
