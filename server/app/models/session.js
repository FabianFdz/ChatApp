var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SessionSchema   = new Schema({
    // _id : Number,
    user : { type : Schema.Types.ObjectId, ref : 'User' },
    accessOn : { type: Date, default: Date.now },
    expiresOn : { type: Date, default: Date.now },
    active : { type: Boolean, default: true }
});

SessionSchema.statics.get = function(id, callback) {
    return this.findOne({
        _id : id,
        accessOn : { $gte : Date.now },
        expiresOn : { $lt : Date.now },
        active : true
    }).populate('user').exec(callback);
}

module.exports = mongoose.model('Session', SessionSchema);
