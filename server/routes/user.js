var express = require('express');
var router = express.Router();

var SessionService = require('../app/services/session');
var Response = require('../app/response');
var User = require('../app/models/user');

function successResponse(userData, sessionID) {
    Response.success({
        id : userData._id,
        username : userData.username,
        avatar : userData.avatar || 'http://www.gravatar.com/avatar',
        session : sessionID
    });
}

router.post('/register', function(req, res, next) {

    Response.use(res);

    // @todo validar si el usuario ya existe

    var user = new User();
    user.username = req.body.username;
    user.password = req.body.password;
    user.avatar = 'http://www.gravatar.com/avatar';
    user.active = true;

    user.save(function(userErr, userData) {
        Response.checkError(userErr);
        SessionService.start(res, userData._id, successResponse.bind(this, userData));
    });
});

router.post('/login', function(req, res, next) {
    Response.use(res);

    User.login(req.body.username, req.body.password, function(err, userData) {

        Response.checkError(err);

        if (!userData || userData.length === 0) {
            Response.checkError('invalid_user');
        } else {
            SessionService.start(res, userData._id, successResponse.bind(this, userData));
        }
    });
});

module.exports = router;
