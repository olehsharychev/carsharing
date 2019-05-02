var express = require('express');
var router = express.Router();
var moment = require('moment');
var con = require('../lib/connection.js');
var authentication = require('../lib/authentication');


router.get('/', authentication, function (req, res, next) {
    var query = `SELECT DISTINCT 
                 IF(message.message_author_id = ${req.user.user_id}, 
                 message.message_recipient_id, 
                 message.message_author_id) 
                 AS chat_with_id,
                 user.user_login AS chat_with_user
                 FROM message, user
                 WHERE (message.message_author_id = ${req.user.user_id} 
                 OR message.message_recipient_id = ${req.user.user_id})
                 AND user.user_id = IF(message.message_author_id = ${req.user.user_id}, 
                 message.message_recipient_id, 
                 message.message_author_id)
                 GROUP BY message.message_author_id, message.message_recipient_id
                 ORDER BY message.message_id;`;

    con.query(query, function (err, result) {
        if (err) throw err;

        var chats = {chats: result};


        chats.user_id = req.user.user_id;

        console.log(chats);
        res.render('chats', chats);
    });

});

router.get('/chat-with-:user_id', authentication, function (req, res, next) {
    var query = `SELECT message.*, user.user_login message_author 
                 FROM message
                 LEFT JOIN user ON user.user_id = message.message_author_id 
                 WHERE
                 (message.message_author_id = ${req.params.user_id}
                 AND
                 message.message_recipient_id = ${req.user.user_id})
                 OR 
                 (message.message_author_id = ${req.user.user_id}
                 AND
                 message.message_recipient_id = ${req.params.user_id})`;
    con.query(query, function (err, result) {
        if (err) throw err;
        res.render('messages', {messages: result, recipient_id: req.params.user_id});
    });
});

router.post('/send-message-to-:recipient_id', authentication, function (req, res, next) {
    if (!req.body) res.sendStatus(400);
    var datetime = moment().format('YYYY-MM-DD HH:mm:ss');
    var query = `INSERT INTO message VALUES 
                 (NULL,
                 ${req.user.user_id},
                 ${req.params.recipient_id},
                 '${req.body.messageText}',
                 STR_TO_DATE("${datetime}", "%Y-%m-%d %H:%i:%s"))`;
    con.query(query, function (err) {
        if (err) throw err;
        res.redirect(`/chats/chat-with-${req.params.recipient_id}`);
    });
});
module.exports = router;
