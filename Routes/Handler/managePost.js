const express = require('express');
const router = express.Router();
const fetchAdmin = require('../../Middleware/fetchAdmin');
const fetchUser = require('../../Middleware/fetchUser');
const Post = require('../../Models/Post');
const Follow = require('../../Models/Follow');
const BlackList = require('../../Models/BlackList');
const Notification = require('../../Models/Notification');


router.post('/create', fetchUser, async (req, res) => {

    try {

        const sessionUserID = req.user.id
        const { postImageURL, postCaption, postType } = req.body;

        const validateBlackList = await BlackList.findOne({ "userID": sessionUserID })

        if (validateBlackList) {
            res.send({ "error": "User is blacklisted" })
        }

        const data = Post({
            "userID": sessionUserID,
            "postImageURL": postImageURL,
            "postCaption": postCaption,
            "postType": postType
        })

        const newPost = await data.save()

        res.send({
            "success": true,
            "message": "Post Added"
        })

    } catch (error) {
        console.log(error.message);
        res.send({ "error": "Internal Server Error" })
    }

})

router.post('/edit/:postID', fetchUser, async (req, res) => {

    try {

        let newPost = {}

        const sessionUserID = req.user.id;
        const { postCaption, postType } = req.body;

        if (postCaption) { newPost.postCaption = postCaption }
        if (postType) { newPost.postType = postType }

        const postID = req.params.postID;

        const validateBlackList = await BlackList.findOne({ "userID": sessionUserID })

        if (validateBlackList) {
            return res.send({ "error": "You are blacklisted" })
        }

        const post = await Post.findByIdAndUpdate(postID, { $set: newPost }, { new: true })

        res.send({
            "success": true,
            "message": "Post Updated",
            "newPost": newPost
        })

    } catch (error) {
        console.log(error.message);
        res.send({ "error": "Internal Server Error" })
    }

})

router.post('/fetch-all-post-user/:page', fetchUser, async (req, res) => {
    // fetch all post on home screen


    try {

        const page = Number(req.params.page);

        const limit = 5;

        const offset = (page - 1) * limit;

        const today = new Date();

        const daysAgo = new Date(today.getTime() - (3 * 24 * 60 * 60 * 1000));

        // const allPost = await Post.find({ "postType": "public", date: { $gte: daysAgo } }).sort({ engagementScore: -1, date: -1 }).skip(offset).limit(limit).exec()

        const allPost = await Post.find({ "postType": "public" }).sort({ date: -1 }).skip(offset).limit(limit).exec()

        const allPostLength = await Post.find({ "postType": "public" })

        res.json({ "allPost": allPost, "allPostLength": allPostLength.length })


    } catch (error) {
        console.log(error.message);
        res.send({ "error": "Internal Server Error" })
    }

})

router.post('/fetch-recommended-post/:page', fetchUser, async (req, res) => {

    try {

        const pageNumber = Number(req.params.page);

        const pageSize = 5;

        const sessionUserID = req.user.id;

        const followedUserList = await Follow.find({ userID: sessionUserID })

        const followedUserIds = followedUserList.map((data => data.following))

        // Fetch the posts of the followed users and sort by date
        const posts = await Post.find({ userID: { $in: followedUserIds }, postType: "public" }).sort({ date: -1 });

        // Fetch the rest of the post data
        const restOfThePosts = await Post.find({ userID: { $nin: followedUserIds }, postType: "public" }).sort({ date: -1 });

        // Combine the fetched posts and rest of the posts
        const allPosts = [...posts, ...restOfThePosts];

        // Paginate the allPosts array
        const totalPosts = allPosts.length;
        const startIndex = (pageNumber - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const totalPages = Math.ceil(totalPosts / pageSize);
        const paginatedPosts = allPosts.slice(startIndex, endIndex);

        console.log('followedUserList', followedUserList)

        console.log('--------------------------------------------------------------')

        console.log('followedUserIds', followedUserIds)

        console.log('--------------------------------------------------------------')

        console.log('post', posts)

        console.log('--------------------------------------------------------------')

        console.log('restOfThePosts', restOfThePosts)

        res.json({ "allPost": paginatedPosts, "allPostLength": totalPosts })

    } catch (error) {
        console.log(error)
        res.send({ error: "Internal Server Error" })
    }

})

router.post('/fetch-my-post/:page', fetchUser, async (req, res) => {
    // fetch my post
    try {

        const sessionUserID = req.user.id

        const page = Number(req.params.page);

        const limit = 5;

        const offset = (page - 1) * limit;

        const myPost = await Post.find({ "userID": sessionUserID }).sort({ _id: -1 }).skip(offset).limit(limit);

        const myPostLength = await Post.find({ "userID": sessionUserID })

        res.json({ "myPost": myPost, "myPostLength": myPostLength.length })

    } catch (error) {
        console.log(error.message);
        res.send({ "error": "Internal Server Error" })
    }

})

router.post('/fetch-user-post/:userID/:page', fetchUser, async (req, res) => {
    // fetch post of other users
    try {

        const UserID = req.params.userID;

        const page = Number(req.params.page);

        const limit = 5;

        const offset = (page - 1) * limit;

        const usersPost = await Post.find({ "userID": UserID, "postType": "public" }).sort({ _id: -1 }).skip(offset).limit(limit)

        const usersPostLength = await Post.find({ "userID": UserID, "postType": "public" })

        res.json({ "usersPost": usersPost, "usersPostLength": usersPostLength.length })

    } catch (error) {
        console.log(error.message);
        res.send({ "error": "Internal Server Error" })
    }

})

router.post('/fetch-post/:postID', fetchUser, async (req, res) => {
    // fetch a particular post
    try {

        const postID = req.params.postID;

        const post = await Post.findOne({ "_id": postID })

        res.json(post)

    } catch (error) {
        console.log(error.message);
        res.send({ "error": "Internal Server Error" })
    }

})

router.delete('/user/delete-post/:postID', fetchUser, async (req, res) => {
    // delete a particular post by user
    try {

        const postID = req.params.postID;

        const validatePost = await Post.findById(postID)

        if (!validatePost) {
            return res.send({ error: "Something Went Wrong" })
        }

        const postDelete = await Post.findByIdAndDelete(postID)

        res.send({
            "success": true,
            "message": "Post Deleted"
        })

    } catch (error) {
        console.log(error.message);
        res.send({ "error": "Internal Server Error" })
    }

})

router.delete('/admin/delete-post/:postID', fetchAdmin, async (req, res) => {

    try {

        const postID = req.params.postID;

        const validatePost = await Post.findById(postID)

        if (!validatePost) {

            return res.send({ error: "404 - Post not found" })

        }

        const postDelete = await Post.findByIdAndDelete(postID)

        const notification = Notification({

            "interaction": false,
            "userID": validatePost.userID,
            "notificationText": "your post has been removed by the admins."

        })

        await notification.save()

        res.send({
            "success": true,
            "message": "Post Deleted"
        })

    } catch (error) {
        console.log(error.message);
        res.send({ "error": "Internal Server Error" })
    }

})

router.post('/admin/fetch-all-post-admin/:page', fetchAdmin, async (req, res) => {

    try {

        const page = Number(req.params.page);

        const limit = 6;

        const offset = (page - 1) * limit;

        const allPost = await Post.find().sort({ date: -1 }).skip(offset).limit(limit).exec()

        const allPostLength = await Post.find().exec()

        res.send({ post: allPost, postLength: allPostLength.length })

    } catch (error) {
        console.log(error.message);
        res.send({ "error": "Internal Server Error" })
    }

})

module.exports = router;