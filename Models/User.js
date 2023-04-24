const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    bio: {
        type: String
    },
    gender: {
        type: String
    },
    DOB: {
        type: Date
    },
    profileURL: {
        type: String
    },
    signupDate: {
        type: Date,
        default: Date.now
    },
    isPartner: {
        type: Boolean,
        default: false
    }
})


module.exports = mongoose.model('user', UserSchema)