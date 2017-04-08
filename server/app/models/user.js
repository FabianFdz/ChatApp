var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    username : String,
    password : String,
    active : Boolean
});

UserSchema.statics.login = function(username, password, callback) {
    return this.findOne({
        username : username,
        password : password,
        active : true
    }, callback);
}

module.exports = mongoose.model('User', UserSchema);
