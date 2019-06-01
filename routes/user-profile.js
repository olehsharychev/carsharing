var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var con = require('../lib/connection.js');
var moment = require('moment');
var crypto = require('crypto');
var fs = require('fs');
var authentication = require('../lib/authentication');

var multer  = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/user_photos/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname)
    }
});

var upload = multer({ storage: storage });

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
            console.log(result[0][0]);
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

router.post('/edit/save/:user_id', authentication, upload.single('userPhoto'), function (req, res) {

    var selectUser = `SELECT * FROM user WHERE user_id = ${req.params.user_id};
                      SELECT COUNT(message_unread) AS amount_unread FROM message WHERE
                      message_unread = 1
                      AND
                      message_recipient_id = ${req.user.user_id};`;

    console.log(req.body);

    con.query(selectUser, function (err, result) {
        if (err) throw err;

        var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';
        salt = salt + '' + req.body.oldPassword;
        var encPassword = crypto.createHash('sha1').update(salt).digest('hex');
        var dbPassword = result[0][0].user_password;


        var newData = {
            user_id: result[0][0].user_id,
            user_login: result[0][0].user_login,
            user_firstname: result[0][0].user_firstname,
            user_surname: result[0][0].user_surname,
            user_email: req.body.email,
            user_telnum: req.body.telnum,
            user_cardnum: req.body.cardnum
        };

        // если старый пароль введен неверно, то рендерим страницу редактирования с новыми данными
        if(encPassword != dbPassword){
            res.render('edit-profile', {
                user: newData,
                currentUser: req.user.user_id,
                currentRole: req.user.user_role_id,
                amountUnread: result[1][0].amount_unread,
                wrongPass: 1
            });
        }
        else {
            var updateQuery = `
                UPDATE user SET
                user_email = '${req.body.email}',
                user_telnum = '${req.body.telnum}',
                user_cardnum = '${req.body.cardnum}'
            `;

            // если пользователь выбрал какуе-то новое фото, то удаляем старое и добавляем новое к запросу
            if (req.file){
                fs.unlink(`public/uploads/user_photos/${result[0][0].user_photo_path}`, function (err) {
                    if (err) throw err;
                });
                updateQuery += `, user_photo_path = '${req.file.filename}'`
            }

            // если пользователь ввел новый пароль, то добавляем его хеш к запросу
            if (req.body.newPassword != ''){
                var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';
                salt = salt + '' + req.body.newPassword;
                var encPassword = crypto.createHash('sha1').update(salt).digest('hex');
                updateQuery += `, user_password = '${encPassword}'`;
            }

            updateQuery += ` WHERE user_id = ${req.params.user_id}`;

            con.query(updateQuery, function (err, result) {
                res.redirect(`/profile/${req.params.user_id}`);
            });
        }
    });
});

module.exports = router;
