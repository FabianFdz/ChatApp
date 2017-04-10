var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    // _id : Number,
    active : {
        type : Boolean,
        default : true
    },
    avatar : {
        type : String,
        default : 'http://www.gravatar.com/avatar'
    },
    password : {
        type : String,
        required: true
    },
    username : {
        type : String,
        required: true
    }
});

UserSchema.statics.exists = function(username, callback) {
    return this.findOne({
        username : username
    }, callback);
}

UserSchema.statics.login = function(username, password, callback) {
    return this.findOne({
        username : username,
        password : password,
        active : true
    }, callback);
}

UserSchema.statics.search = function(filter, callback) {
    var regex = new RegExp(filter, "i");
    return this.find({
        username : regex,
        active : true
    }, '_id username', callback);
}

module.exports = mongoose.model('User', UserSchema);
