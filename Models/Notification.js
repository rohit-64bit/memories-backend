const mongoose = require('mongoose');

const { Schema } = mongoose;

const NotificationSchema = new Schema({
    date: {
        type: Date,
        default: Date.now,
        index: { expires: '7d' }
    },
    interaction: {
        type: Boolean
    },
    postID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post'
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: 'true'
    },
    userInteracted: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: 'true'
    },
    notificationText: {
        type: String,
    }
})

module.exports = mongoose.model('notification', NotificationSchema)