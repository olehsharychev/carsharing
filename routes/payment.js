var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var moment = require('moment');
var con = require('../lib/connection.js');
var authentication = require('../lib/authentication');
var LiqPay = require('liqpay-sdk');
var crypto = require('crypto');



router.get('/:ad_id', authentication, function(req, res, next) {
    var public_key = "i9221338865";
    var private_key = "11m1lvjWewQTlbZRiCnVuWU7vLJUjObSxoKdgvHY";

    var data = 'eyJhY3Rpb24iOiJwMnAiLCJwYXltZW50X2lkIjoxMDEzNDQyNDYxLCJzdGF0dXMiOiJzYW5kYm94IiwidmVyc2lvbiI6MywidHlwZSI6ImJ1eSIsInBheXR5cGUiOiJjYXJkIiwicHVibGljX2tleSI6Imk5MjIxMzM4ODY1IiwiYWNxX2lkIjo0MTQ5NjMsIm9yZGVyX2lkIjoib3JkZXJfaWRfMiIsImxpcXBheV9vcmRlcl9pZCI6IjM2WkhZUVRNMTU1NjgyOTQyNDY4MDE2NCIsImRlc2NyaXB0aW9uIjoiZGVzY3JpcHRpb24gdGV4dCIsInNlbmRlcl9jYXJkX21hc2syIjoiNTM1NTU3KjM0Iiwic2VuZGVyX2NhcmRfYmFuayI6IlBVQkxJQyBKT0lOVCBTVE9DSyBDT01QQU5ZIFwiQUwiLCJzZW5kZXJfY2FyZF90eXBlIjoibWMiLCJzZW5kZXJfY2FyZF9jb3VudHJ5Ijo4MDQsImlwIjoiNzguMTU0LjE2Ny4yNTMiLCJhbW91bnQiOjEuMCwiY3VycmVuY3kiOiJVQUgiLCJzZW5kZXJfY29tbWlzc2lvbiI6NS4wLCJyZWNlaXZlcl9jb21taXNzaW9uIjowLjAsImFnZW50X2NvbW1pc3Npb24iOjAuMCwiYW1vdW50X2RlYml0IjoxLjAsImFtb3VudF9jcmVkaXQiOjEuMCwiY29tbWlzc2lvbl9kZWJpdCI6NS4wLCJjb21taXNzaW9uX2NyZWRpdCI6MC4wLCJjdXJyZW5jeV9kZWJpdCI6IlVBSCIsImN1cnJlbmN5X2NyZWRpdCI6IlVBSCIsInNlbmRlcl9ib251cyI6MC4wLCJhbW91bnRfYm9udXMiOjAuMCwibXBpX2VjaSI6IjciLCJpc18zZHMiOmZhbHNlLCJsYW5ndWFnZSI6InJ1IiwiY3JlYXRlX2RhdGUiOjE1NTY4Mjk0MjQ2ODUsImVuZF9kYXRlIjoxNTU2ODI5NDI0Njk4LCJ0cmFuc2FjdGlvbl9pZCI6MTAxMzQ0MjQ2MX0=';
    var buff = Buffer.from(data, 'base64');
    var responseJSON = JSON.parse(buff.toString('utf-8'));
    console.log(responseJSON);
    var query = `SELECT ad_author_id FROM ad WHERE ad_id = ${req.params.ad_id}`;
    con.query(query, function (err, result) {
        if (err) throw err;
        res.render('payment', {result: result});
    });
});

// router.post('https://www.liqpay.ua/api/3/checkout', function (req, res, next) {
//     var public_key = "i9221338865";
//     var private_key = "11m1lvjWewQTlbZRiCnVuWU7vLJUjObSxoKdgvHY";
//     var LiqPay = require('liqpay');
//     var liqpay = new LiqPay(public_key, private_key);
//     liqpay.api("request", {
//         "action"         : "p2p",
//         "version"        : "3",
//         "phone"          : "380950000001",
//         "amount"         : "1",
//         "currency"       : "USD",
//         "description"    : "description text",
//         "order_id"       : "order_id_1",
//         "receiver_card"  : "4731195301524633",
//         "card"           : "4731195301524634",
//         "card_exp_month" : "03",
//         "card_exp_year"  : "22",
//         "card_cvv"       : "111",
//         "sandbox"        : "1"
//     }, function( json ){
//         console.log( json.status );
//     });
// });
module.exports = router;