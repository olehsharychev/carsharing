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
                 GROUP BY ad.ad_id;
                 SELECT * FROM user_vote WHERE vote_for_user_id = ${req.params.user_id};`;
    con.query(query, function (err, result) {
        if (err) throw err;
        console.log(result);
        res.render('user-profile', {user: result, currentUser: req.user.user_id});
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


module.exports = router;
