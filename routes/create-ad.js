var express = require('express');
var router = express.Router();
var con = require('../lib/connection.js');
var multer  = require('multer');
var moment = require('moment');
var authentication = require('../lib/authentication');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/ad_photos/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname)
    }
});

var upload = multer({ storage: storage });

router.get('/', authentication, function (req, res, next) {

    // подсчет непрочитанных сообщений
    var countMessagesQuery = `SELECT COUNT(message_unread) AS amount_unread FROM message WHERE
                              message_unread = 1
                              AND
                              message_recipient_id = ${req.user.user_id};`;
    con.query(countMessagesQuery, function (err, result) {

        // проверяем является ли текущий пользователь арендодателем
        if (req.user.user_role_id === 3) {
            res.render('create-ad', {
                currentUser: req.user.user_id,
                currentRole: req.user.user_role_id,
                amountUnread: result[0].amount_unread,
                moment: moment
            });
        }
        else {
            res.sendStatus(404);
        }
    });
});

router.post('/', authentication, upload.array('carPhoto', 10), function (req, res) {
    if (!req.body) return res.sendStatus(400);

    var datetime = moment().format('YYYY-MM-DD HH:mm:ss');

    console.log(req.body);
    var query = `INSERT INTO ad VALUES 
                (NULL, 
                '${req.body.title}',
                '${req.body.description}',
                STR_TO_DATE("${datetime}", "%Y-%m-%d %H:%i:%s"),
                '${req.body.price}',
                ${req.user.user_id}, 
                '${req.body.brand}',
                '${req.body.model}',
                '${req.body.engine}',
                '${req.body.power}',
                '${req.body.year}',
                '${req.body.mileage}',
                '${req.body.transmission}',
                '${req.body.dateFrom}',
                '${req.body.dateTo}',
                '${req.body.lat}',
                '${req.body.lng}')`;

    con.query(query, function (err) {
        if (err) throw err;

        // записываем имена файлов фотографий по последнему айди объявления
        con.query("SELECT MAX(ad_id) AS ad_id FROM ad", function (err, rows) {
            if (err) throw err;
            var adId = rows[0].ad_id;
            var imgQuery = `INSERT INTO image VALUES ?`;
            var values = [];
            var i = 0;
            req.files.forEach(function () {
                values[i] = ['NULL', `${adId}`, `${req.files[i].filename}`];
                i++;
            });
            con.query(imgQuery, [values], function (err) {
                if (err) throw err;
                res.redirect('/cars');
            });
        });
    });


});

module.exports = router;
