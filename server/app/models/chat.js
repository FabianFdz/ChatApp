var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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
}, { toJSON: { virtuals: true } });

ChatSchema.virtual('messages', {
    ref: 'Message',
    localField: '_id',
    foreignField: 'chat'
});

ChatSchema.statics.exists = function(participants, callback) {
    return this.findOne({
        active : true,
        participants : { $in : participants }
    }, '_id', callback);
}

ChatSchema.statics.history = function(id, callback) {
    return this.findOne({
        _id : id,
        active : true
    }, '_id messages').populate('messages').exec(callback);
}

module.exports = mongoose.model('Chat', ChatSchema);
