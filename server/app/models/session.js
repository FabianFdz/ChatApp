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
        default: Date.now
    },
    user : {
        type : Schema.Types.ObjectId,
        ref : 'User',
        required: true
    }
});

SessionSchema.statics.get = function(id, callback) {
    return this.findOne({
        _id : id,
        accessOn : { $lte : Date.now() },
        expiresOn : { $gt : Date.now() },
        active : true
    }, '_id user').populate('user', '_id username').exec(callback);
}

module.exports = mongoose.model('Session', SessionSchema);
