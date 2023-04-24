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

        console.log(req.user);

        const userID = req.user.id

        const userVerify = await User.findById(userID)
        if (!userVerify) {
            return res.send({ "error": "no user found" })
        }

        const otpValidate = await Otp.findOne({ "userID": userID })

        if (otpValidate) {
            return res.send({ "error": "otp already exists" })
        }

        const data = Otp({
            "userID": userID,
            "OTP": otp
        })

        const saveOTP = await data.save()

        // send a email to the user with otp

        res.json({
            "success": true,
            "message": "otp generated"
        })

    } catch (error) {
        console.error(error.message);
        res.send({ error: "Internal Server Error" });
    }

})

router.post('/verify', fetchUser, async (req, res) => {

    try {

        const { otp } = req.body

        const sessionUserID = req.user.id

        const otpData = await Otp.findOne({
            "userID": sessionUserID
        })

        if (!otpData) {
            return res.send({ error: "Otp Not Exist !" })
        }

        if (Number(otp) === otpData.OTP) {
            return res.json({
                success: true,
                message: "otp validated !"
            })
        }

    } catch (error) {
        console.log(error.message)
        res.send("Internal Server Error");
    }

})


module.exports = router;