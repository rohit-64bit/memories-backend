const mongoose = require('mongoose');

const { Schema } = mongoose;

const ReportSchema = new Schema({
    ReporterID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: 'true'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: 180 }
    },
    postID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post',
        require: 'true'
    },
    reportText: {
        type: String,
        require: 'true'
    }
})

module.exports = mongoose.model('report', ReportSchema)