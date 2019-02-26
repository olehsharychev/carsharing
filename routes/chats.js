var express = require('express');
var router = express.Router();
var con = require('../lib/connection.js');
var authentication = require('../lib/authentication');


router.get('/', authentication, function (req, res, next) {
    var query = `SELECT DISTINCT 
                 IF(message_author_id = ${req.user.user_id}, message_recipient_id, message_author_id) AS chat_with_id 
                 FROM message 
                 WHERE message_author_id = ${req.user.user_id} OR message_recipient_id = ${req.user.user_id}
                 GROUP BY message_author_id, message_recipient_id
                 ORDER BY message_id;`;

    con.query(query, function (err, result) {
        if (err) throw err;

        var chats = {chats: result};


        chats.user_id = req.user.user_id;

        console.log(chats);
        res.render('chats', chats);
    });

});

module.exports = router;
