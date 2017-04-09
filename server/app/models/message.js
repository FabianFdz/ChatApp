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

module.exports = mongoose.model('Message', MessageSchema);
