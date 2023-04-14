const express = require('express');
const router = express.Router();
const fetchAdmin = require('../../Middleware/fetchAdmin');
const User = require('../../Models/User');
const BlackList = require('../../Models/BlackList');
const fetchUser = require('../../Middleware/fetchUser');

router.post('/add-to-blacklist', fetchAdmin, async (req, res) => {

    try {

        const { userID } = req.body;

        const userValidate = await User.findOne({ "_id": userID })

        if (!userValidate) {
            return res.send({ "error": "User not found" });
        }

        const data = BlackList({
            "userID": userID
        })

        const blackListUser = await data.save()

        res.send({
            "success": true,
            "message": "User Blacklisted"
        })

    } catch (error) {
        console.log(error.message);
        res.send({ "error": "Internal Server Error" });
    }

})

router.post('/admin/fetch-blacklist', fetchAdmin, async (req, res) => {

    try {

        const { userID } = req.body;

        const validateBlackList = await BlackList.findOne({ "userID": userID })

        if (!validateBlackList) {
            return res.send({ "error": "User is safe." })
        }

        res.send({
            "success": true,
            "message":"User is Blacklisted"
        })

    } catch (error) {
        console.log(error.message);
        res.send({ "error": "Internal Server Error" });
    }

})

router.post('/user/fetch-blacklist', fetchUser, async (req, res) => {

    try {

        const userID = req.user.id;

        const validateBlackList = await BlackList.findOne({ "userID": userID })

        if (!validateBlackList) {
            return res.send({ "error": "User is safe." })
        }

        res.send({
            "success": true,
            "message":"User is Blacklisted"
        })

    } catch (error) {
        console.log(error.message);
        res.send({ "error": "Internal Server Error" });
    }

})

module.exports = router;