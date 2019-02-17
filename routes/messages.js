var express = require('express');
var router = express.Router();
var con = require('../lib/connection.js');
var authentication = require('../lib/authentication');


router.get('/', authentication, function (req, res, next) {
    res.render('messages');
});

module.exports = router;
