const mongoose = require('mongoose');

const { Schema } = mongoose;

const CommentSchema = new Schema({
    date: {
        type: Date,
        default: Date.now,
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: 'true'
    },
    postID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post',
        require: 'true'
    },
    commentText: {
        type: String,
        require: true
    }
})

module.exports = mongoose.model('comment', CommentSchema)