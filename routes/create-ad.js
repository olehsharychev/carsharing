var express = require('express');
var router = express.Router();
var con = require('../lib/connection.js');

router.get('/', function (req, res, next) {
    res.render('create-ad');
});

router.post('/', function (req, res) {
    if (!req.body) return res.sendStatus(400);

    var query = "INSERT INTO `ad` (`ad_id`, `ad_tittle`, `ad_description`, `ad_date`, `ad_rating`, `ad_price`," +
        " `ad_author_id`, `car_brand`, `car_model`, `car_engine`, `car_power`, `car_year`, `car_mileage`," +
        " `car_transmition_id`) VALUES (NULL, '" + req.body.tittle +
        " ', '" + req.body.description +
        "', '2018-10-29','0', '" +
        req.body.price +
        "', '7', '" + req.body.brand +
        "', '" + req.body.model +
        "', '" + req.body.engine +
        "', '" + req.body.power +
        "', '" + req.body.year + "" +
        "', '" + req.body.mileage +
        "', '1')";

    con.query(query, function (err) {
        if (err) throw err;
    });

    res.redirect('/cars');
});

module.exports = router;
