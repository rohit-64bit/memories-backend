const express = require('express');
const router = express.Router();
const User = require('../../Models/User');
const fetchUser = require('../../Middleware/fetchUser');

router.post('/get-user-profile', fetchUser, async (req, res) => {

    try {

        const userID = req.user.id

        const user = await User.findById(userID).select("-password")

        res.send(user);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }

})

router.put('/edit-user-profile', fetchUser, async (req, res) => {

    const { name, userName, bio, gender, DOB, profileURL } = req.body;

    const userID = req.user.id

    try {

        const newUser = {}

        if (name) { newUser.name = name }
        if (userName) { newUser.userName = userName }
        if (bio) { newUser.bio = bio }
        if (gender) { newUser.gender = gender }
        if (DOB) { newUser.DOB = DOB }
        if (profileURL) { newUser.profileURL = profileURL }

        let userVerification = await User.findById(userID);
        if (!userVerification) {
            return res.send({ "error": "User Not Found" })
        }

        if (userName !== userVerification.userName) {

            const validateUserName = await User.findOne({ "userName": userName })

            if (validateUserName) {
                return res.send({ "error": "Username Taken" })
            }

        }


        const user = await User.findByIdAndUpdate(userID, { $set: newUser }, { new: true })

        res.send({ success: true, message: "Profile Updated" })

    } catch (error) {

        console.log(error.message);
        res.send({ error: "Internal Server Error" })

    }

})

router.post('/get-profile-of/:userID', fetchUser, async (req, res) => {

    try {
        const { userID } = req.params;

        const userProfile = await User.findOne({ "_id": userID }).select("-password")

        if (!userProfile) {
            res.send({ "error": "User Not Found" })
        }

        res.send({
            userProfile,
            "success": true
        })

    } catch (error) {

        console.log(error.message);
        res.send("Internal Server Error")

    }

})


module.exports = router;