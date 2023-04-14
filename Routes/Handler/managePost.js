const express = require('express');
const router = express.Router();
const fetchAdmin = require('../../Middleware/fetchAdmin');
const fetchUser = require('../../Middleware/fetchUser');
const Post = require('../../Models/Post');
const BlackList = require('../../Models/BlackList');


router.post('/create', fetchUser, async (req, res) => {

    try {

        const sessionUserID = req.user.id
        const { postImageURL, postCaption } = req.body;

        const validateBlackList = await BlackList.findOne({ "userID": sessionUserID })

        if (validateBlackList) {
            res.send({ "error": "User is blacklisted" })
        }

        const data = Post({
            "userID": sessionUserID,
            "postImageURL": postImageURL,
            "postCaption": postCaption
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

        const sessionUserID = req.user.id;
        const { postCaption } = req.body;
        const postID = req.params.postID;

        const validateBlackList = await BlackList.findOne({ "userID": sessionUserID })

        if (validateBlackList) {
            res.send({ "error": "User is blacklisted" })
        }

        const post = await Post.findByIdAndUpdate(postID, { $set: { "postCaption": postCaption } }, { new: true })

        res.send({
            "success": true,
            "message": "Post Updated"
        })

    } catch (error) {
        console.log(error.message);
        res.send({ "error": "Internal Server Error" })
    }

})

router.post('/fetch-all-post-user', fetchUser, async (req, res) => {

    try {

        const allPost = await Post.find().sort({ _id: -1 })

        res.json(allPost)

    } catch (error) {
        console.log(error.message);
        res.send({ "error": "Internal Server Error" })
    }

})

router.post('/fetch-my-post', fetchUser, async (req, res) => {

    try {

        const sessionUserID = req.user.id

        const myPost = await Post.find({ "userID": sessionUserID }).sort({ _id: -1 })

        res.json(myPost)

    } catch (error) {
        console.log(error.message);
        res.send({ "error": "Internal Server Error" })
    }

})

router.post('/fetch-user-post/:userID', fetchUser, async (req, res) => {

    try {

        const UserID = req.params.userID;

        const usersPost = await Post.find({ "userID": UserID }).sort({ _id: -1 })

        res.json(usersPost)

    } catch (error) {
        console.log(error.message);
        res.send({ "error": "Internal Server Error" })
    }

})

router.post('/fetch-post/:postID', fetchUser, async (req, res) => {

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

    try {

        const postID = req.params.postID;

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

router.post('/fetch-all-post-admin', fetchAdmin, async (req, res) => {

    try {

        const allPost = await Post.find().sort({ _id: -1 })

        res.json(allPost)

    } catch (error) {
        console.log(error.message);
        res.send({ "error": "Internal Server Error" })
    }

})

module.exports = router;