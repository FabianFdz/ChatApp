var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SessionSchema   = new Schema({
    user : String,
    accessOn : Number,
    expiresOn : Number
});

module.exports = mongoose.model('Session', SessionSchema);
