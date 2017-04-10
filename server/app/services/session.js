var Response = require('../response');
var Session = require('../models/session');

module.exports = {
    start : function(res, userID, onSuccess) {
        Response.use(res);

        Session.exists(userID, function(sessionErr, sessionData) {

            Response.error(sessionErr);

            if (sessionData) {
                onSuccess(sessionData._id, false);
            } else {
                var session = new Session();
                session.user = userID;
                session.save(function(saveErr, sessionData) {
                    Response.error(saveErr);
                    onSuccess(sessionData._id, true);
                });
            }
        });
    },
    get : function (res, sessionID, callback) {
        Response.use(res);

        Session.get(sessionID, function(sessionErr, sessionData) {
            Response.error(sessionErr);

            if (!sessionData || sessionData.length === 0) {
                Response.error('invalid_session');
            } else {
                callback(sessionData);
            }
        });
    },
    end : function(res, sessionID) {
        Response.use(res);
        Session.update({ _id : sessionID },{ $set: { active : false }}, function(sessionErr) {
            Response.error(sessionErr);
            Response.success({});
        });
    }
};
