var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Message = require('./message');

var ChatSchema = new Schema({
    // _id : Number,
    active : {
        type : Boolean,
        default : true
    },
    createdOn : {
        type : Date,
        default : Date.now
    },
    creator : {
        type : Schema.Types.ObjectId,
        ref : 'User',
        required: true
    },
    participants : [{
        type : Schema.Types.ObjectId,
        ref : 'User',
        required: true
    }],
    title : String
});

ChatSchema.statics.exists = function(participants, callback) {
    return this.findOne({
        active : true,
        participants : { $all : participants, $size : participants.length }
    }, '_id', callback);
}

ChatSchema.statics.participates = function(userID, callback) {
    return this.find({
        active : true,
        participants : userID
    }, '_id participants')
    .populate({
        path : 'participants',
        match : { _id : { $ne : userID }},
        select : '_id username avatar'
    })
    .exec(callback);
}

ChatSchema.statics.isParticipant = function(chatID, userID, callback) {
    return this.findOne({
        _id : chatID,
        participants : userID,
        active : true
    }, callback);
}

module.exports = mongoose.model('Chat', ChatSchema);
