const express = require('express');
const router = express.Router();
const fetchUser = require('../../Middleware/fetchUser');
const BlackList = require('../../Models/BlackList');
const fetchAdmin = require('../../Middleware/fetchAdmin');
const Comment = require('../../Models/Comment');
const Post = require('../../Models/Post');


router.post('/create', fetchUser, async (req, res) => {

    try {

        const sessionUserID = req.user.id;
        const { commentText, postID } = req.body;

        const commentScore = 7;

        const validateBlackList = await BlackList.findOne({ "userID": sessionUserID })

        if (validateBlackList) {
            return res.send({ "error": "User is blacklisted" })
        }

        const postData = await Post.findOne({ "_id": postID }).exec()

        postData.engagementScore = postData.engagementScore + commentScore

        await postData.save()

        const data = Comment({
            "userID": sessionUserID,
            "commentText": commentText,
            "postID": postID
        })

        await data.save()

        res.send({
            "success": true,
            "message": "Comment Added"
        })

    } catch (error) {
        console.log(error.message);
        res.send({ "error": "Internal Server Error" })
    }

})

router.post('/fetch-comment-of-post/:postID/:page', fetchUser, async (req, res) => {

    try {

        const { postID } = req.params;

        const page = Number(req.params.page);

        const limit = 7;

        const offset = (page - 1) * limit;

        const commentList = await Comment.find({ "postID": postID }).sort({ _id: -1 }).skip(offset).limit(limit).exec()

        const commentListSize = await Comment.find({ "postID": postID })

        res.json({ "commentList": commentList, "commentListSize": commentListSize.length })

    } catch (error) {

        console.log(error.message);
        res.send({ "error": "Internal Server Error" })

    }
})

router.post('/delete', fetchUser, async (req, res) => {

    try {

        const commentDeleteScore = 5;

    } catch (error) {
        console.log(error.message);
        res.send({ "error": "Internal Server Error" })
    }

})


module.exports = router;