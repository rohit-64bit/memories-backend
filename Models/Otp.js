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
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: 180 }
    }
})

module.exports = mongoose.model('otp', OtpSchema)