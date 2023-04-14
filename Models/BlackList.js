const mongoose = require('mongoose');

const { Schema } = mongoose;

const BlacklistSchema = new Schema({
    date: {
        type: Date,
        default: Date.now,
        index: { expires: '5h' }
    },
    blackListType: {
        type: String,
        default: 'temporary'
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: 'true'
    }
})

module.exports = mongoose.model('blacklist', BlacklistSchema)