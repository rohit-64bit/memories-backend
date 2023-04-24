const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { Schema } = mongoose;

const PostSchema = new Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    postImageURL: {
        type: String,
    },
    postType: {
        type: String,
        required: true
    },
    postCaption: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now
    },
    engagementScore: {
        type: Number,
        default: 0
    }
})

PostSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('post', PostSchema)