const express = require('express');
const router = express.Router();
const Otp = require('../../Models/Otp');
const fetchUser = require('../../Middleware/fetchUser');
const User = require('../../Models/User');
const otpGenerator = require('otp-generator')


router.post('/create', fetchUser, async (req, res) => {

    const otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false
    });

    try {

        const userID = req.user.id

        const userVerify = await User.findById(userID)
        if (!userVerify) {
            return res.send({ "error": "no user found" })
        }

        const otpValidate = await Otp.find({ "userID": userID })

        if (!otpValidate) {
            return res.send({ "error": "otp already exists" })
        }

        const data = Otp({
            "userID": userID,
            "OTP": otp
        })

        data.save()

        // send a email to the user with otp

        res.json({ "success": "otp generated" })

    } catch (error) {
        console.error(error);
        res.send("Internal Server Error");
    }

})

router.post('/verify', fetchUser, async (req, res) => {

    try {

        const { otp } = req.body
        const userID = req.user.id

        const otpData = await Otp.findOne({
            "userID": userID
        })

        if (!otpData) {
            return res.send({ "error": "Something went wrong try again" })
        }

        if (otp === otpData.OTP) {
            return res.json({ "success": "otp validated !" })
        }

        res.send({ "error": "Otp validation failed" })

    } catch (error) {
        console.log(error.message)
        res.send("Internal Server Error");
    }

})


module.exports = router;