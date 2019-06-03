var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var moment = require('moment');
var fs = require('fs');
var con = require('../lib/connection.js');
var authentication = require('../lib/authentication');

var multer  = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/ad_photos/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname)
    }
});

var upload = multer({ storage: storage });

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
            moment.locale("ru");
            car[0].ad_date_to = moment(car[0].ad_date_to).format('LL');
            car[0].ad_date_from = moment(car[0].ad_date_from).format('LL');

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
                    console.log(result);
                    result.forEach(function (item) {
                        moment.locale('ru');
                        item.bid_datetime = moment(item.bid_datetime).format('LLL');
                    });
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
                        result[0].forEach(function (item) {
                            moment.locale('ru');
                            item.comment_datetime = moment(item.comment_datetime).format('LLL');
                        });
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

router.get('/edit/:ad_id', authentication, function (req, res) {

    var query = `SELECT * FROM ad WHERE ad_id = ${req.params.ad_id};
                 SELECT COUNT(message_unread) AS amount_unread FROM message WHERE
                 message_unread = 1
                 AND
                 message_recipient_id = ${req.user.user_id};`;

    con.query(query, function (err, result) {
        if (err) throw err;

        // если на страницу редактирования зашел не автор объявления, то отправляет статус 404
        if (result[0][0].ad_author_id != req.user.user_id){
            res.sendStatus(404);
        }
        else {
            res.render('edit-car', {
                ad: result[0][0],
                currentUser: req.user.user_id,
                currentRole: req.user.user_role_id,
                amountUnread: result[1][0].amount_unread,
                moment: moment
            });
        }
    });
});

router.post('/edit/save/:ad_id', authentication, upload.array('carPhoto', 10), function (req, res) {

    // удаляем старые фото, если пользователь выбрал новые
    if(req.files.length != 0){
        var selectDeleteImages = `
            SELECT image_path FROM image WHERE ad_id = ${req.params.ad_id};
            DELETE FROM image WHERE ad_id = ${req.params.ad_id};
        `;
        con.query(selectDeleteImages, function (err, result) {
            if (err) throw err;
            result[0].forEach(function (imagePath) {
                fs.unlink(`public/uploads/ad_photos/${imagePath.image_path}`, function (err) {
                    if (err) throw err;
                });
            });
        });

        // записываем новые фото в таблицу БД
        var insertImages = `INSERT INTO image VALUES ?`;
        var i = 0;
        var values = [];
        req.files.forEach(function (imagePath) {
            values[i] = ['NULL', `${req.params.ad_id}`, `${imagePath.filename}`];
            i++;
        });
        console.log(values);
        con.query(insertImages, [values], function (err, result) {
            if (err) throw err;
        });
    }

    // приведение к нужному формату дат
    req.body.dateFrom = moment(req.body.dateFrom).format('YYYY-MM-DD');
    req.body.dateTo = moment(req.body.dateTo).format('YYYY-MM-DD');

    var updateQuery = `
        UPDATE ad SET
        ad_tittle = '${req.body.title}',
        ad_description = '${req.body.description}',
        ad_price = '${req.body.price}',
        car_brand = '${req.body.brand}',
        car_model = '${req.body.model}',
        car_engine = '${req.body.engine}',
        car_power = '${req.body.power}',
        car_year = '${req.body.year}',
        car_mileage = '${req.body.mileage}',
        car_transmission = '${req.body.transmission}',
        ad_date_from = '${req.body.dateFrom}',
        ad_date_to = '${req.body.dateTo}',
        ad_lat = '${req.body.lat}',
        ad_lng = '${req.body.lng}'
        WHERE ad_id = ${req.params.ad_id}
    `;

    // запись новых данных в БД
    con.query(updateQuery, function (err, result) {
        if (err) throw err;
        res.redirect(`/cars/view-car/${req.params.ad_id}`);
    });
});

router.get('/delete/:ad_id', function (req, res) {

    var selectQuery = `SELECT * FROM ad WHERE ad_id = ${req.params.ad_id};`;
    con.query(selectQuery, function (err, result) {
        if (err) throw err;
        if (result.length != 0){
            if(result[0].ad_author_id == req.user.user_id){
                var deleteQuery = `
                    SELECT image_path FROM image WHERE ad_id = ${req.params.ad_id};
                    DELETE FROM ad WHERE ad_id = ${req.params.ad_id};
                `;
                con.query(deleteQuery, function (err, result) {
                    if(err) throw err;
                    result[0].forEach(function (image) {
                        fs.unlink(`public/uploads/ad_photos/${image.image_path}`, function (err) {
                            if (err) throw err;
                        });
                    });
                    res.redirect('/cars');
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

module.exports = router;
