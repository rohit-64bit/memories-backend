const mongoose = require('mongoose');

const { Schema } = mongoose;

const VerificationSchema = new Schema({

    date: {
        type: Date,
        default: Date.now
    },
    verificationType: {
        type: String
    },
    isTerminated: {
        type: Boolean,
        default: false
    },
    terminationReason: {
        type: String
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: 'true'
    },
    verificationText: {
        type: String
    },
    instaLink: {
        type: String
    },
    githubLink: {
        type: String
    },
    discordLink: {
        type: String
    },
    youtubeLink: {
        type: String
    }

})

module.exports = mongoose.model('verification', VerificationSchema)