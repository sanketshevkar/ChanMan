
const mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    username: String,
    email: String,
    dateCrawled: Date
});
 

module.exports = User = mongoose.model('User', userSchema);;