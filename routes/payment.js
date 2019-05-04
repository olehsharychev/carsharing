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
    // console.log(responseJSON);
    var query = `SELECT bid_id FROM bid WHERE 
                 ad_id = ${req.params.ad_id} 
                 AND 
                 bid_author_id = ${req.user.user_id} 
                 AND 
                 bid_confirmed = "1"`;
    con.query(query, function (err, result) {
        if (err) throw err;

        // если результат пустой, значит зашли на страницу не с акка, у которого подтверждена заявка
        // в таком случае отправляем статус 404
        if (result.length == 0){
            res.sendStatus(404);
        }
        else {

            // формируем json для html формы с кнопкой оплаты
            var json = {
                public_key: "i9221338865",
                server_url: "http://6a866735.ngrok.io",
                action: "p2p",
                version: "3",
                phone: "380634157659",
                amount: "1",
                currency: "UAH",
                description: "description text",
                order_id: `order_id_${result[0].bid_id}`,
                receiver_card: "5355571105528434",
                sandbox: "1"
            };

            // получение signature и data
            var jsonString = JSON.stringify(json);
            var data = Buffer.from(jsonString).toString('base64');
            var signString = private_key + data + private_key;
            var sha1 = crypto.createHash('sha1');
            sha1.update(signString);
            var signature = sha1.digest('base64');

            res.render('payment', {result: result, data: data, signature: signature});
        }
    });
});

module.exports = router;