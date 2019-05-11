var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var moment = require('moment');
var con = require('../lib/connection.js');
var authentication = require('../lib/authentication');

router.get('/:ad_id', authentication, function(req, res, next) {

    var adId = req.params.ad_id;
    var adQuery = `SELECT * FROM ad WHERE ad_id = ${adId}`;

    // получение отдельного объявления
    con.query(adQuery, function (err, result, fields) {
        if (err) throw err;
        if (result.length == 0) {
            console.log('Cannot find the record in the DB');
            res.sendStatus(404);
        }
        else {
            var car = result;
            car[0].user_id = req.user.user_id;
            car[0].user_role_id = req.user.user_role_id;

            // получение всех фотографий объявления
            var imageQuery = `SELECT * FROM image WHERE ad_id = ${adId}`;
            con.query(imageQuery, function (err, result, fields) {
                if (err) throw err;
                car[car.length] = {images: result};

                // получение всех заявок к объявлению
                var bidQuery = `SELECT bid.*, user.user_login from bid
                                left join user on user.user_id = bid.bid_author_id
                                where bid.ad_id = ${adId}`;
                con.query(bidQuery, function (err, result, fields) {
                    if (err) throw err;
                    car[car.length] = {bids: result};

                    // получение списка комментариев
                    // подсчет непрочитанных сообщений
                    var comMesQuery = `SELECT comment.*, user.user_login FROM comment 
                                         LEFT JOIN user ON user.user_id = comment.comment_author_id
                                         WHERE comment_ad_id = ${adId};
                                         SELECT COUNT(message_unread) AS amount_unread FROM message WHERE
                                         message_unread = 1
                                         AND
                                         message_recipient_id = ${req.user.user_id};`;
                    con.query(comMesQuery, function (err, result, fields) {
                        if (err) throw err;
                        car[car.length] = {comments: result[0]};
                        res.render('view-car', {
                            car: car,
                            currentUser: req.user.user_id,
                            currentRole: req.user.user_role_id,
                            amountUnread: result[1][0].amount_unread
                        });
                    });
                });
            });
        }
    });
});

router.get('/:ad_id/delete-bid/:bid_id', authentication, function(req, res, next){

    var bidId = req.params.bid_id;
    var bidAuthorQuery = `SELECT bid_author_id FROM bid WHERE bid_id = ${bidId}`;
    con.query(bidAuthorQuery, function (err, result) {

        if (err) throw err;

        if (result.length) {
            if (req.user.user_id == result[0].bid_author_id) {
                var deleteQuery = `DELETE FROM bid WHERE bid_id = ${bidId}`;
                con.query(deleteQuery, function (err, result) {

                    if (err) throw err;
                    res.redirect(`/cars/view-car/${req.params.ad_id}`);
                });
            }
            else {
                res.sendStatus(404);
            }
        }
        else {
            res.sendStatus(404);
        }
    });


});

router.get('/:ad_id/confirm-bid/:bid_id', authentication, function(req, res, next){

    var adId = req.params.ad_id;
    var adAuthorQuery = `SELECT ad_author_id FROM ad WHERE ad_id = ${adId}`;
    con.query(adAuthorQuery, function (err, result) {
        if (err) throw err;
        if (result.length) {
            if (req.user.user_id == result[0].ad_author_id) {
                var query = `UPDATE bid SET bid_confirmed = 1 WHERE bid_id = ${req.params.bid_id}`;
                con.query(query, function (err, result) {
                    if (err) throw err;
                    res.redirect(`/cars/view-car/${req.params.ad_id}`);
                });
            }
            else{
                res.sendStatus(404);
            }
        }
        else {
            res.sendStatus(404);
        }
    });

});

router.post('/send-bid/:ad_id', authentication, function(req, res) {

    var datetime = moment().format('YYYY-MM-DD HH:mm:ss');
    var query = `INSERT INTO bid VALUES (
                 NULL,
                 ${req.params.ad_id},
                 ${req.user.user_id},
                 '${req.body.bidDescription}',
                 ${req.body.bidPrice},
                 STR_TO_DATE("${datetime}", "%Y-%m-%d %H:%i:%s"),
                 '0',
                 '0')`;

    con.query(query, function (err) {
        if (err) throw err;
        res.redirect(`/cars/view-car/${req.params.ad_id}`);
    });
});

router.post('/send-comment/:ad_id', authentication, function (req, res) {

    var datetime = moment().format('YYYY-MM-DD HH:mm:ss');
    var query = `INSERT INTO comment VALUES (
                 NULL,
                 ${req.user.user_id},
                 ${req.params.ad_id},
                 '${req.body.commentText}',
                 STR_TO_DATE("${datetime}", "%Y-%m-%d %H:%i:%s"))`;
    con.query(query, function (err) {
        if (err) throw err;
        res.redirect(`/cars/view-car/${req.params.ad_id}`);
    });
});

module.exports = router;
