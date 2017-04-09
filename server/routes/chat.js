var express = require('express');
var router = express.Router();

var SessionService = require('../app/services/session');
var Response = require('../app/response');
var Chat = require('../app/models/chat');

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
