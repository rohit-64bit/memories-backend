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
    bio: {
        type: String
    },
    name: {
        type: String,
        required: true
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
    }
})


module.exports = mongoose.model('user', UserSchema)