const mongoose = require('mongoose');

const { Schema } = mongoose;

const PostSchema = new Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    postImageURL: {
        type: String,
    },
    postCaption: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('post', PostSchema)