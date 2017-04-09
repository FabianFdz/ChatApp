var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    // _id : Number,
    active : { type: Boolean, default: true },
    password : String,
    username : String
});

UserSchema.statics.login = function(username, password, callback) {
    return this.findOne({
        username : username,
        password : password,
        active : true
    }, callback);
}

module.exports = mongoose.model('User', UserSchema);
