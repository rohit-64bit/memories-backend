const express = require('express');
const router = express.Router();
const fetchUser = require('../../Middleware/fetchUser');
const BlackList = require('../../Models/BlackList');
const Like = require('../../Models/Like');
const fetchAdmin = require('../../Middleware/fetchAdmin');
const Post = require('../../Models/Post');
const Notification = require('../../Models/Notification');
const User = require('../../Models/User');

router.post('/like-dislike', fetchUser, async (req, res) => {

    try {

        const likeScore = 10;
        const dislikeScore = 7;

        const sessionUserID = req.user.id;

        const { postID } = req.body

        const validateUserBan = await User.findById(sessionUserID)

        if (validateUserBan.isBanned) {
            return res.send({ "error": "You are Permanently Banned" })
        }

        const validateBlackList = await BlackList.findOne({ "userID": sessionUserID })

        if (validateBlackList) {
            return res.send({ "error": "You are blacklisted" })
        }

        const validateLike = await Like.findOne({
            "userID": sessionUserID,
            "postID": postID
        })

        if (validateLike != null) {

            const disLike = await Like.findOneAndDelete({
                "userID": sessionUserID,
                "postID": postID
            })

            const postData = await Post.findOne({ "_id": postID }).exec()

            postData.engagementScore = postData.engagementScore - dislikeScore

            await postData.save()

            return res.send({
                "success": true,
                "message": "Post Disliked"
            })

        }

        const data = Like({
            "userID": sessionUserID,
            "postID": postID
        })

        const like = await data.save()

        const postData = await Post.findOne({ "_id": postID }).exec()

        if (postData.userID != sessionUserID) {
            const notification = Notification({

                "interaction": true,
                "userID": postData.userID,
                "userInteracted": sessionUserID,
                "notificationText": "commented on your post.",
                postID: postData._id

            })

            await notification.save()
        }

        postData.engagementScore = postData.engagementScore + likeScore

        await postData.save()

        if (postData.userID != sessionUserID) {

            const notification = Notification({

                "interaction": true,
                "userID": postData.userID,
                "userInteracted": sessionUserID,
                "notificationText": "liked your post."

            })

            await notification.save()

        }

        res.send({
            "success": true,
            "message": "Post Liked"
        })

    } catch (error) {
        console.log(error.message);
        res.send({ "error": "Internal Server Error" })
    }

})

router.post('/fetch-like-status', fetchUser, async (req, res) => {

    try {

        const sessionUserID = req.user.id;

        const { postID } = req.body

        const likeStatus = await Like.findOne({ "userID": sessionUserID, "postID": postID })

        if (likeStatus != null) {
            return res.send({ "success": true, "message": "Dislike" })
        }

        res.send({ "success": false, "message": "Like" })

    } catch (error) {
        console.log(error.message);
        res.send("Internal Server Error")
    }

})

router.post('/fetch-like-post/:postID/:page', fetchUser, async (req, res) => {

    // fetch all likes of a single post

    try {

        const postID = req.params.postID

        const page = Number(req.params.page);

        const limit = 7;

        const offset = (page - 1) * limit;

        const likesPost = await Like.find({ "postID": postID }).sort({ _id: -1 }).skip(offset).limit(limit).exec()

        const allLikesPost = await Like.find({ "postID": postID })

        res.json({ "likesPost": likesPost, "allLikesPost": allLikesPost.length })

    } catch (error) {
        console.log(error.message);
        res.send({ "error": "Internal Server Error" })
    }

})

router.post('/fetch-all-likes', fetchAdmin, async (req, res) => {

    // used for admin panel

    try {

        const allLikes = await Like.find()
        res.json(allLikes)

    } catch (error) {
        console.log(error.message);
        res.send({ "error": "Internal Server Error" })
    }

})


module.exports = router;