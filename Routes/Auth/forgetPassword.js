const express = require('express');
const router = express.Router();

const nodemailer = require('nodemailer');
require('dotenv').config()
const env = process.env;

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

        if (!userValidate) {
            return res.send({ "error": "User Not Found" })
        }

        const userID = userValidate._id

        const otpValidate = await Otp.findOne({ "userID": userID })

        if (otpValidate) {
            return res.send({ "error": "otp already exists" })
        }

        const data = Otp({
            "userID": userID,
            "OTP": otp,
            "type": "reset"
        })

        data.save()

        const client = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: env.MAIL,
                pass: env.MAIL_SECRET
            }
        });

        client.sendMail(
            {
                from: env.MAIL,
                to: email,
                subject: `Hey ${userValidate.name} reset your password!`,
                html: `<html>
                <head>
                <meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
body {
font-family: Arial, sans-serif;
font-size: 16px;
color: #333;
background-color: #f7f7f7;
padding: 20px;
margin: 0;
width:100%;
}
</style>
                </head>
                <body>
                <table style="width: 100%; max-width: 600px; margin: 0 auto;">
<tr>
<td style="background-color: #000000; color: #ffffff; font-size: 2rem; font-weight: bold; padding: 2rem; text-align: center;">hey! ${userValidate.name}</td>
</tr>
<tr>
<td style="padding: 2rem;">
  <p style="font-size: 1rem;">Reset your account password by using this OTP if you think that this is note done by you than you should secure your account.</p>
  <div style="margin-top: 2rem;">
    <div style="font-size: 0.8rem;">To reset your password please use this OTP</div>
    <div style="font-size: 3rem; font-weight: bold; text-align: center;">${otp}</div>
  </div>
  <div style="font-size: 0.8rem; opacity: 0.8; margin-top: 2rem;">
    <p>Thanks &amp; Regards</p>
    <p>Developers Team</p>
    <p><a href=${env.CLIENT_URL} style="font-weight: bold; color: #000000; text-decoration: none; border-bottom: 1px solid #6b7280; display: inline-block;">thememories.social</a></p>
  </div>
</td>
</tr>
<tr>
<td style="background-color: #d1d5db; padding: 1rem; text-align: center;">
  <a href=${env.CLIENT_URL} style="font-weight: bold; opacity: 0.8; transition: opacity 0.3s ease-in-out; color: #000000; text-decoration: none; border-bottom: 2px solid #6b7280;">thememories.social</a>
</td>
</tr>
</table>
                </body>
                </html>`
            }
        )

        res.json({
            "success": true,
            "message": "OTP generated",
            "type": "reset",
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

        if (Number(otp) === otpData.OTP) {

            otpData.verifiedStatus = true
            await otpData.save()

            return res.json({
                "success": true,
                "message": "otp validated !",
                "type": otpData.type
            })

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

        const otpData = await Otp.findOne({
            "userID": sessionUserID
        })

        if (otpData.type != "reset" && !otpData.verifiedStatus) {
            return res.send({ "error": "OTP Session Expired" })
        }

        const salt = await bcrypt.genSalt(10)
        const secPass = await bcrypt.hash(password, salt);

        const updateUserPassword = await User.findByIdAndUpdate(sessionUserID, { password: secPass }, { new: true })

        const client = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: env.MAIL,
                pass: env.MAIL_SECRET
            }
        });

        client.sendMail(
            {
                from: env.MAIL,
                to: email,
                subject: `Hey ${userValidate.name} reset your password!`,
                html: `<html>
                <head>
                <meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
body {
font-family: Arial, sans-serif;
font-size: 16px;
color: #333;
background-color: #f7f7f7;
padding: 20px;
margin: 0;
width:100%;
}
</style>
                </head>
                <body>
                <table style="width: 100%; max-width: 600px; margin: 0 auto;">
<tr>
<td style="background-color: #000000; color: #ffffff; font-size: 2rem; font-weight: bold; padding: 2rem; text-align: center;">hey! ${userValidate.name}</td>
</tr>
<tr>
<td style="padding: 2rem;">
  <p style="font-size: 1rem;">Password is succesfully changed for your account ✨.</p>
  <div style="font-size: 0.8rem; opacity: 0.8; margin-top: 2rem;">
    <p>Thanks &amp; Regards</p>
    <p>Developers Team</p>
    <p><a href=${env.CLIENT_URL} style="font-weight: bold; color: #000000; text-decoration: none; border-bottom: 1px solid #6b7280; display: inline-block;">thememories.social</a></p>
  </div>
</td>
</tr>
<tr>
<td style="background-color: #d1d5db; padding: 1rem; text-align: center;">
  <a href=${env.CLIENT_URL} style="font-weight: bold; opacity: 0.8; transition: opacity 0.3s ease-in-out; color: #000000; text-decoration: none; border-bottom: 2px solid #6b7280;">thememories.social</a>
</td>
</tr>
</table>
                </body>
                </html>`
            }
        )

        res.json({
            "success": true,
            "message": "Password Updated Login"
        })

    } catch (error) {

        console.log(error.message);
        res.send("Internal Server Error")

    }

})


module.exports = router;