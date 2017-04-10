var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SessionSchema   = new Schema({
    // _id : Number,
    accessOn : {
        type: Date,
        default: Date.now
    },
    active : {
        type: Boolean,
        default: true
    },
    expiresOn : {
        type: Date,
        default: function() {
            return Date.now() + (1 * 24 * 60 * 60 * 100);
        }
    },
    user : {
        type : Schema.Types.ObjectId,
        ref : 'User',
        required: true
    }
});

function getValidSessionConditions() {
    return {
        accessOn : { $lte : Date.now() },
        expiresOn : { $gt : Date.now() },
        active : true
    };
}

function getValidSession(filter, callback) {
    var criteria = Object.assign(filter, getValidSessionConditions());
    return this.findOne(criteria, '_id user')
               .populate('user', '_id username')
               .exec(callback);
}

SessionSchema.statics.exists = function(userID, callback) {
    return getValidSession.call(this, { user : userID }, callback);
}

SessionSchema.statics.get = function(id, callback) {
    return getValidSession.call(this, { _id : id }, callback);
}

module.exports = mongoose.model('Session', SessionSchema);
