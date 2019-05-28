var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var con = require('../lib/connection.js');
var moment = require('moment');
var authentication = require('../lib/authentication');

router.get('/:user_id', authentication, function (req, res, next) {
    
    var query = `SELECT * FROM user WHERE user_id = ${req.params.user_id};
                 SELECT * FROM ad, image WHERE 
                 ad.ad_id = image.ad_id
                 AND
                 ad.ad_author_id = ${req.params.user_id}
                 GROUP BY ad.ad_id;
                 SELECT * FROM user_vote WHERE vote_for_user_id = ${req.params.user_id};
                 SELECT COUNT(message_unread) AS amount_unread FROM message WHERE
                 message_unread = 1
                 AND
                 message_recipient_id = ${req.user.user_id};`;
    con.query(query, function (err, result) {
        if (err) throw err;
        result[1].forEach(function (item) {
            moment.locale('ru');
            item.ad_date_from = moment(item.ad_date_from).format('LL');
            item.ad_date_to = moment(item.ad_date_to).format('LL');
            item.ad_datetime = moment(item.ad_datetime).format('LLL');
        });
        res.render('user-profile', {
            user: result,
            currentUser: req.user.user_id,
            currentRole: req.user.user_role_id,
            amountUnread: result[3][0].amount_unread
        });
    });
});

router.get('/vote-rating-plus/:user_id', authentication, function (req, res, next) {

    // делаем проверку не голосует ли пользователь сам за себя
    if (req.params.user_id === req.user.user_id){
        res.sendStatus(404);
    }
    else {

        var selectQuery = `SELECT * FROM user_vote WHERE voted_user_id = ${req.user.user_id}`;
        con.query(selectQuery, function (err, result, next) {

            // проверка не голосовал ли уже текущий пользователь
            // за пользователя, страница которого открыта в данный момент
            if (result.length == 0){

                // записываем в таблицу user_vote информацию о том за какого пользователя голосовал какой пользователь
                // в таблице user увеличиваем на 1 рейтинг пользователя
                var insertQuery = `INSERT INTO user_vote VALUES(
                       NULL,
                       ${req.params.user_id},
                       ${req.user.user_id});
                       UPDATE user SET user_rating = (user_rating + 1)
                       WHERE user_id = ${req.params.user_id};`;

                con.query(insertQuery, function (err, result) {
                    if (err) throw err;
                    res.redirect(`/profile/${req.params.user_id}`);
                });
            }

            // если текущий пользователь уже голосовал, то отправляем ошибку 404
            else {
                res.sendStatus(404);
            }
        });
    }
});

router.get('/vote-rating-minus/:user_id', authentication, function (req, res, next) {

    // делаем проверку не голосует ли пользователь сам за себя
    if (req.params.user_id === req.user.user_id){
        res.sendStatus(404);
    }
    else {

        var selectQuery = `SELECT * FROM user_vote WHERE voted_user_id = ${req.user.user_id}`;
        con.query(selectQuery, function (err, result, next) {

            // проверка не голосовал ли уже текущий пользователь
            // за пользователя, страница которого открыта в данный момент
            if (result.length == 0){

                // записываем в таблицу user_vote информацию о том за какого пользователя голосовал какой пользователь
                // в таблице user уменьшаем на 1 рейтинг пользователя
                var insertQuery = `INSERT INTO user_vote VALUES(
                       NULL,
                       ${req.params.user_id},
                       ${req.user.user_id});
                       UPDATE user SET user_rating = (user_rating - 1)
                       WHERE user_id = ${req.params.user_id};`;

                con.query(insertQuery, function (err, result) {
                    if (err) throw err;
                    res.redirect(`/profile/${req.params.user_id}`);
                });
            }

            // если текущий пользователь уже голосовал, то отправляем ошибку 404
            else {
                res.sendStatus(404);
            }
        });
    }
});

router.get('/edit/:user_id', authentication, function (req, res) {

    // если страницу редактирования профиля пытается открыть не хозяин профиля, то 404
    if (req.params.user_id != req.user.user_id){
        res.sendStatus(404);
    }
    else {

        var selectUser = `SELECT * FROM user WHERE user_id = ${req.params.user_id};
                          SELECT COUNT(message_unread) AS amount_unread FROM message WHERE
                          message_unread = 1
                          AND
                          message_recipient_id = ${req.user.user_id};`;
        con.query(selectUser, function (err, result) {
            if (err) throw err;

            // если пользователя с таким id не существует
            if (result.length == 0){
                res.sendStatus(404);
            }
            else {
                res.render('edit-profile', {
                    user: result[0][0],
                    currentUser: req.user.user_id,
                    currentRole: req.user.user_role_id,
                    amountUnread: result[1][0].amount_unread
                });
            }
        })
    }
});

router.post('/edit/save/:user_id', function (req, res) {
    
});

module.exports = router;
