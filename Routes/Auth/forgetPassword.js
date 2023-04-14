const express = require('express');
const router = express.Router();
const Otp = require('../../Models/Otp');
const User = require('../../Models/User');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcryptjs');


router.post('/send-otp', async (req, res) => {

    const otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false
    });

    try {

        const { email } = req.body;

        const userValidate = await User.findOne({ "email": email }).select("-password")

        console.log(userValidate);
        if (!userValidate) {
            return res.send({ "error": "User Validation Failed" })
        }

        const userID = userValidate._id

        const otpValidate = await Otp.findOne({ "userID": userID })

        if (otpValidate) {
            return res.send({ "error": "otp already exists" })
        }

        const data = Otp({
            "userID": userID,
            "OTP": otp
        })

        data.save()

        // send email to the user with otp and a awareness type msg of password change

        res.json({
            "success": true,
            "message": "otp generated",
            "email": email,
            "userID": userID
        })
    } catch (error) {
        console.log(error);
        res.send("Internal Server Error");
    }

})

router.post('/verify-otp', async (req, res) => {

    try {

        const { email, otp } = req.body;

        const userValidate = await User.findOne({ "email": email }).select("-password")

        console.log(userValidate);
        if (!userValidate) {
            return res.send({ "error": "User Verification Failed" })
        }

        const userID = userValidate._id

        const otpData = await Otp.findOne({
            "userID": userID
        })

        if (!otpData) {
            return res.send({ "error": "Otp Not Found" })
        }

        if (otp === otpData.OTP) {
            return res.json({ "success": true, "message": "otp validated !" })
        }

        res.send({ "error": "Otp validation failed" })

    } catch (error) {
        console.log(error);
        res.send("Internal Server Error");
    }
})

router.post('/update-password', async (req, res) => {

    try {

        const { email, password } = req.body;

        const userValidate = await User.findOne({ "email": email })

        const sessionUserID = userValidate._id

        if (!userValidate) {
            return res.send({ "error": "User Not Found" })
        }

        const salt = await bcrypt.genSalt(10)
        const secPass = await bcrypt.hash(password, salt);

        const updateUserPassword = await User.findByIdAndUpdate(sessionUserID, { password: secPass }, { new: true })

        // send a info type email with message of password change successfully

        res.json({
            "success": true,
            "message": "Password Updated Successfully"
        })


    } catch (error) {
        console.log(error.message);
        res.send("Internal Server Error")
    }

})


module.exports = router;