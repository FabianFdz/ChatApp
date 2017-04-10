var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
    // _id : Number,
    chat : {
        type : Schema.Types.ObjectId,
        ref : 'Chat',
        required: true
    },
    createdOn : {
        type : Date,
        default : Date.now
    },
    owner : {
        type : Schema.Types.ObjectId,
        ref : 'User',
        required: true
    },
    text : {
        type : String,
        required: true
    }
});

MessageSchema.statics.history = function(chatID, callback) {
    return this.find({
        chat : chatID
    }, '_id text createdOn owner').populate('owner', '_id username avatar').exec(callback);
}

module.exports = mongoose.model('Message', MessageSchema);
