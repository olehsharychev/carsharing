var express = require('express');
var router = express.Router();
var con = require('../lib/connection.js');
var multer  = require('multer');
var authentication = require('../lib/authentication');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {

        cb(null, Date.now() + file.originalname)
    }
});

var upload = multer({ storage: storage });

router.get('/', authentication, function (req, res, next) {
    res.render('create-ad');
});

router.post('/', upload.array('carPhoto', 10), function (req, res) {
    if (!req.body) return res.sendStatus(400);

    var query = `INSERT INTO ad VALUES 
                (NULL, 
                '${req.body.tittle}',
                '${req.body.description}',
                '2018-10-29',
                '0',
                '${req.body.price}',
                ${req.user.user_id}, 
                '${req.body.brand}',
                '${req.body.model}',
                '${req.body.engine}',
                '${req.body.power}',
                '${req.body.year}',
                '${req.body.mileage}',
                '1')`;

    con.query(query, function (err) {
        if (err) throw err;
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
