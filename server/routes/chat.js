var express = require('express');
var router = express.Router();

var SessionService = require('../app/services/session');
var Response = require('../app/response');
var Chat = require('../app/models/chat');

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

        // @todo validar si otro chat existe

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
    SessionService.get(res, req.body.session, function() {
        // Chat.find()
    });
});

router.get('/:chatId', function(req, res) {
    SessionService.get(res, req.body.session, function() {
        console.log(req.params);
        Chat.history(req.params.chatId)
    });
});

router.post('/:chatId', function(req, res) {
    SessionService.get(res, req.body.session, function() {
        // new Message()
    });
});

module.exports = router;
