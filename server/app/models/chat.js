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
    participants : [{
        type : Schema.Types.ObjectId,
        ref : 'User',
        required: true
    }],
    title : {
        type : String,
        required: true
    }
}, { toJSON: { virtuals: true } });

ChatSchema.virtual('messages', {
    ref: 'Message',
    localField: '_id',
    foreignField: 'chat'
});

ChatSchema.statics.history = function(id, callback) {
    return this.findOne({
        _id : id,
        active : true
    }).populate('messages').exec(callback);
}

module.exports = mongoose.model('Chat', ChatSchema);
