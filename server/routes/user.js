var express = require('express');
var router = express.Router();

var SessionService = require('../app/services/session');
var Response = require('../app/response');
var User = require('../app/models/user');

function successResponse(userData, sessionID, sessionCreated) {
    Response.success({
        id : userData._id,
        username : userData.username,
        avatar : userData.avatar || 'http://www.gravatar.com/avatar',
        // @todo mover session a una referencia virtual?
        session : {
            id : sessionID,
            created : sessionCreated
        }
    });
}

router.post('/register', function(req, res) {

    Response.use(res);

    var username = req.body.username,
        password = req.body.password;

    if (!username) {
        Response.error('missing_field_username');
        return;
    }

    if (!password) {
        Response.error('missing_field_password');
        return;
    }

    User.exists(username, function(userErr, userData) {

        Response.error(userErr);

        if (userData) { // active?
            Response.error('user_exists');
        } else { // on null
            var user = new User();
            user.username = username;
            user.password = password;

            user.save(function(saveErr, userData) {
                Response.error(saveErr);
                SessionService.start(res, userData._id, successResponse.bind(this, userData));
            });
        }
    });
});

router.post('/login', function(req, res) {

    Response.use(res);

    var username = req.body.username,
        password = req.body.password;

    if (!username) {
        Response.error('missing_field_username');
        return;
    }

    if (!password) {
        Response.error('missing_field_password');
        return;
    }

    User.login(req.body.username, req.body.password, function(err, userData) {

        Response.error(err);

        if (!userData) {
            Response.error('invalid_login');
        } else {
            SessionService.start(res, userData._id, successResponse.bind(this, userData));
        }
    });
});

router.get('/logout', function(req, res) {
    Response.use(res);

    var session = req.query.session;

    if (!session) {
        Response.error('missing_query_session');
        return;
    }

    SessionService.end(res, session);
});

router.get('/search', function(req, res) {
    Response.use(res);

    var filter = req.query.filter || '';

    User.search(filter, function(userErr, userData) {
        Response.error(userErr);
        Response.success({ filter : filter, users : userData });
    });
});

module.exports = router;
