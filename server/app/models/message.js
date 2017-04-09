var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
    // _id : Number,
    chat : { type : Schema.Types.ObjectId, ref : 'Chat' },
    createdOn : { type : Date, default : Date.now },
    owner : { type : Schema.Types.ObjectId, ref : 'User' },
    text : String
});

module.exports = mongoose.model('Message', MessageSchema);
