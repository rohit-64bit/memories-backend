const express = require('express');
const fetchAdmin = require('../../Middleware/fetchAdmin');
const User = require('../../Models/User');
const Post = require('../../Models/Post');
const Like = require('../../Models/Like');
const Comment = require('../../Models/Comment');
const router = express.Router();

router.post('/get-analytics-data', fetchAdmin, async (req, res) => {

    try {

        const totalUser = (await User.find()).length
        const totalPost = (await Post.find()).length
        const totalEngagement = (await Like.find()).length + (await Comment.find()).length

        res.send({ totalUser, totalPost, totalEngagement })

    } catch (error) {
        console.log(error.message)
        res.send({ error: "Internal Server Error" })
    }

})

module.exports = router;