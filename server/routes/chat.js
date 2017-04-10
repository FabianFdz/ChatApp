var express = require('express');
var router = express.Router();

var SessionService = require('../app/services/session');
var Response = require('../app/response');
var Chat = require('../app/models/chat');
var Message = require('../app/models/message');

// @todo move session validation to a middleware

// este request podria eliminarse
router.post('/start', function(req, res) {

    Response.use(res);

    SessionService.get(res, req.body.session, function(sessionData) {
        var creator = sessionData.user._id.toString(),
            recepient = req.body.recepient,
            participants = [creator, recepient];

        if (!recepient) {
            Response.error('missing_field_recepient');
            return;
        }

        if (creator === recepient) {
            Response.error('forever_alone');
            return;
        }

        Chat.exists(participants, function(chatErr, chatData) {

            Response.error(chatErr);

            if (chatData) {
                Response.success({
                    id : chatData._id,
                    created : false
                });
            } else {
                var chat = new Chat();
                chat.creator = creator;
                chat.participants = participants;

                chat.save(function(saveErr, chatData) {
                    Response.error(saveErr);
                    Response.success({
                        id : chatData._id,
                        created : true
                    });
                });
            }
        })
    });
});

router.get('/list', function(req, res) {
    SessionService.get(res, req.query.session, function(sessionData) {
        var user = sessionData.user._id.toString();

        Chat.participates(user, function(chatErr, chatsData) {
            Response.error(chatErr);

            // Filtrar chats donde participa solo
            chatsData = chatsData.filter(function(chat) {
                return chat.participants.length > 0;
            });

            Response.success(chatsData);
        });
    });
});

router.get('/:chatId', function(req, res) {
    SessionService.get(res, req.query.session, function(sessionData) {
        var chat = req.params.chatId;

        if (!chat) {
            Response.error('missing_param_chatid');
            return;
        }

        Message.history(chat, function(messageErr, messagesData) {
            Response.error(messageErr);
            Response.success({
                chat : chat,
                messages : messagesData
            });
        });
    });
});

router.post('/:chatId', function(req, res) {
    SessionService.get(res, req.body.session, function(sessionData) {
        var chat = req.params.chatId,
            sender = sessionData.user._id,
            text = req.body.text;

        if (!chat) {
            Response.error('missing_param_chatid');
            return;
        }

        if (!text) {
            Response.error('missing_field_text');
            return;
        }

        Chat.isParticipant(chat, sender, function(checkErr, chatData) {
            Response.error(checkErr);

            if (chatData) {
                Response.error('not_participant');
            } else {
                var message = new Message();
                message.chat = chat;
                message.owner = sender;
                message.text = text;

                message.save(function(saveErr, messageData) {
                    console.log(messageData);
                    Response.error(saveErr);
                    Response.success({
                        chat : chat,
                        message : messageData._id
                    });
                });
            }
        })
    });
});

module.exports = router;
