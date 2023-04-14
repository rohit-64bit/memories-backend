const express = require('express');
const router = express.Router();
const User = require('../../Models/User');
const fetchUser = require('../../Middleware/fetchUser');

router.post('/get-user-profile', fetchUser, async (req, res) => {

    try {

        const userID = req.user.id

        console.log(userID);

        const user = await User.findById(userID).select("-password")

        res.send(user);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }

})

router.put('/edit-user-profile/:id', fetchUser, async (req, res) => {

    const { name, userName, bio, gender, DOB, profileURL } = req.body;

    const userID = req.params.id

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
            return res.send("User Not Found")
        }

        const user = await User.findByIdAndUpdate(userID, { $set: newUser }, { new: true })

        res.json({ newUser })

    } catch (error) {

        console.log(error.message);
        res.sendStatus(500).json("Internal Server Error")

    }

})


module.exports = router;