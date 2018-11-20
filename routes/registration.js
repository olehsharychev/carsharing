var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var con = require('../lib/connection.js');

router.get('/', function (req, res, next) {
    res.render('registration');
});

router.post('/', function (req, res) {
    if (!req.body) return res.sendStatus(400);

    function getHash(password){
        var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';
        salt = salt + '' + password;
        var encPassword = crypto.createHash('sha1').update(salt).digest('hex');
        return encPassword;
    }

    var query = `INSERT INTO user VALUES 
                (NULL, ${req.body.role}, '${req.body.login}', '${getHash(req.body.password)}');`;

    con.query(query, function (err) {
        if (err) throw err;
    });


    res.redirect('/cars');
});

module.exports = router;
