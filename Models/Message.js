const mongoose = require('mongoose');

const { Schema } = mongoose;

const MessageSchema = new Schema({
    date: {
        type: Date,
        default: Date.now
    },
    chatID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'chat',
        require: 'true'
    },
    senderID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: 'true'
    },
    message: {
        type: String,
        require: true
    }

})

module.exports = mongoose.model('message', MessageSchema)