const express = require('express');
const router = express.Router();
const fetchUser = require('../../Middleware/fetchUser');
const Follow = require('../../Models/Follow');
const BlackList = require('../../Models/BlackList');


router.post('/follow-unfollow', fetchUser, async (req, res) => {

    try {

        const sessionUserID = req.user.id;
        const { following } = req.body;

        const validateBlackList = await BlackList.findOne({ "userID": sessionUserID })

        if (validateBlackList) {
            return res.send({ "error": "User is blacklisted" })
        }

        const validateFollow = await Follow.findOne({
            "userID": sessionUserID,
            "following": following
        })

        if (validateFollow != null) {
            const unfollow = await Follow.findOneAndDelete({
                "userID": sessionUserID,
                "following": following
            })

            return res.send({
                "success": true,
                "message": "User Unfollowed"
            })
        }

        const data = Follow({
            "userID": sessionUserID,
            "following": following
        })

        const follow = await data.save()

        res.send({
            "success": true,
            "message": "User Followed"
        })


    } catch (error) {
        console.log(error.message);
        res.send({ "error": "Internal Server Error" })
    }

})

router.post('/fetch-follow-status', fetchUser, async (req, res) => {

    try {

        const sessionUserID = req.user.id;
        const { followingUserID } = req.body;

        const followStatus = await Follow.findOne({ "userID": sessionUserID, "following": followingUserID });

        if (followStatus != null) {
            return res.send({ "success": true, "message": "Unfollow", "followingStatus": true })
        }

        res.send({ "success": true, "message": "Follow", "followingStatus": false })

    } catch (error) {
        console.log(error.message);
        res.send({ "error": "Internal Server Error" })
    }

})

router.post('/fetch-followers/:page', fetchUser, async (req, res) => {

    try {

        const { userID } = req.body;

        const page = Number(req.params.page);

        const limit = 5;

        const offset = (page - 1) * limit;

        const userFollowers = await Follow.find({ "following": userID }).sort({ _id: -1 }).skip(offset).limit(limit);

        const userFollowersTotal = await Follow.find({ "following": userID });

        res.json({ "userFollowers": userFollowers, "userFollowersTotal": userFollowersTotal.length })

    } catch (error) {
        console.log(error.message);
        res.send({ "error": "Internal Server Error" })
    }

})

router.post('/fetch-following/:page', fetchUser, async (req, res) => {
    try {

        const { userID } = req.body;

        const page = Number(req.params.page);

        const limit = 5;

        const offset = (page - 1) * limit;

        const userFollowing = await Follow.find({ "userID": userID }).sort({ _id: -1 }).skip(offset).limit(limit);

        const userFollowingTotal = await Follow.find({ "userID": userID }).sort({ _id: -1 });

        res.json({ "userFollowing": userFollowing, "userFollowingTotal": userFollowingTotal.length })

    } catch (error) {
        console.log(error.message);
        res.send({ "error": "Internal Server Error" })
    }
})


module.exports = router;