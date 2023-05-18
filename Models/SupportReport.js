const mongoose = require('mongoose');
const { Schema } = mongoose;

const SupportSchema = new Schema({
    ReporterID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: 'true'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    subject: {
        type: String
    },
    description: {
        type: String
    }
})

module.exports = mongoose.model('support', SupportSchema)