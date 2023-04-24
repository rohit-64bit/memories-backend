const mongoose = require('mongoose');

const { Schema } = mongoose;

const VerificationSchema = new Schema({
    date: {
        type: Date,
        default: Date.now
    },
    verificationType: {
        type: String,
        default: 'user'
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: 'true'
    },
    verificationText: {
        type: String,
        require: true,
        default: "user"
    }
})

module.exports = mongoose.model('verification', VerificationSchema)