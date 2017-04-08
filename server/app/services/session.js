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

        session.save(function(sessionErr, sessionData) {
            Response.checkError(sessionErr);
            onSuccess(sessionData._id);
        });
    }
};
