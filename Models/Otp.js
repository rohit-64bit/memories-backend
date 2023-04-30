const mongoose = require('mongoose');

const { Schema } = mongoose;

const OtpSchema = new Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: 'true'
    },
    OTP: {
        type: Number
    },
    type: {
        type: String,
        require: true
    },
    verifiedStatus: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: 300 }
    }
})

module.exports = mongoose.model('otp', OtpSchema)