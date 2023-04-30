const express = require('express');
const fetchUser = require('../../Middleware/fetchUser');
const router = express.Router();
const Post = require('../../Models/Post');
const Report = require('../../Models/Report');

router.post('/send-report', fetchUser, async (req, res) => {

    try {

        const sessionUserID = req.user.id

        const { postID, reportText } = req.body;

        const validatePost = await Post.findOne({ _id: postID })

        if (!validatePost) {
            return res.send({ "error": "Post Not Found" })
        }

        const report = Report({
            ReporterID: sessionUserID,
            postID: postID,
            reportText: reportText
        })

        const data = await report.save()

        res.send({ "success": true, "message":"Report Sent"})

    } catch (error) {
        console.log(error.message)
        res.send({ error: "Internal Server Error" })
    }

})

module.exports = router;