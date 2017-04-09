var Response = require('../response');
var Session = require('../models/session');

module.exports = {
    start : function(res, userID, onSuccess) {
        Response.use(res);

        var session = new Session(),
            now = Date.now();

        session.user = userID;
        session.accessOn = now;
        session.expiresOn = now + (1 * 24 * 60 * 60 * 100);
        session.active = true;

        session.save(function(sessionErr, sessionData) {
            Response.checkError(sessionErr);
            onSuccess(sessionData._id);
        });
    },
    get : function(res, sessionID, onSuccess) {
        Response.use(res);

        Session.get(sessionID, function(sessionErr, sessionData) {
            Response.checkError(sessionErr);

            if (!sessionData || sessionData.length === 0) {
                Response.checkError('invalid_session');
            } else {
                console.log(sessionData);
                onSuccess(sessionData);
            }
        });
    }
};
