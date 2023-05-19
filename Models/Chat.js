const mongoose = require('mongoose');

const { Schema } = mongoose;

const ChatSchema = new Schema({
    date: {
        type: Date,
        default: Date.now
    },
    user: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            require: 'true'
        }
    ],
    recentMessage: {
        type: String
    },
    newMessage: {
        type: Boolean
    },
    newMessageBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('chat', ChatSchema)