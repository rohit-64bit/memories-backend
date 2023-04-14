const mongoose = require('mongoose');

const { Schema } = mongoose;

const FollowSchema = new Schema({
    date: {
        type: Date,
        default: Date.now,
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: 'true'
    },
    following: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: 'true'
    }
})

module.exports = mongoose.model('follow', FollowSchema)