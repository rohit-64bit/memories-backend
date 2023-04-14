const mongoose = require('mongoose');

const { Schema } = mongoose;

const LikeSchema = new Schema({
    date: {
        type: Date,
        default: Date.now,
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: 'true'
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post',
        require: 'true'
    }
})

module.exports = mongoose.model('like', LikeSchema)