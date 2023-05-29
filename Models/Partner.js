const mongoose = require('mongoose');
const { Schema } = mongoose;

const PartnerSchema = new Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: 'true'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    pendingStatus: {
        type: Boolean,
        default: true
    },
    isRejected: {
        type: Boolean,
        default: true
    },
    businessName: {
        type: String
    },
    businessType: {
        type: String
    },
    ownerName: {
        type: String
    },
    email: {
        type: String
    },
    website: {
        type: String
    },
    instaLink: {
        type: String
    },
    facebookLink: {
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
    },
    otherLink: {
        type: String
    }
})

module.exports = mongoose.model('partner', PartnerSchema)