const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require("../../Models/User")
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fetchUser = require('../../Middleware/fetchUser');
const Otp = require('../../Models/Otp');
const otpGenerator = require('otp-generator')

const nodemailer = require('nodemailer')


require('dotenv').config()
const env = process.env;

const jwtSecret = env.JWT_SECRET_USER;

router.post('/createuser', [
    body('email', 'Enter a valid e-mail').isEmail(),
    body('name', 'Enter a valid Name').exists(),
    body('password', 'Password must be atleast 8 characters').isLength({ min: 8 })
], async (req, res) => {

    const otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false
    });

    const { email, userName, name, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        let user = await User.findOne({ email: req.body.email });

        if (user) {
            return res.send({ "error": 'Sorry A user already exists login insted' })
        }

        let userNameVerification = await User.findOne({ userName: req.body.userName });

        if (userNameVerification) {
            return res.send({ "error": 'Sorry user name exists' })
        }

        const salt = await bcrypt.genSalt(10)
        const secPass = await bcrypt.hash(password, salt);

        const userData = await User.create({
            email: email,
            password: secPass,
            name: name,
            userName: userName
        })

        const data = {
            userData: {
                id: userData.id
            }
        }

        const authToken = jwt.sign(data, jwtSecret);

        const otpValidate = await Otp.find({ "userID": data.userData.id })

        if (!otpValidate) {
            return res.send({ "error": "otp already exists" })
        }

        const generateOTP = Otp({
            "userID": data.userData.id,
            "OTP": otp,
            "type": "auth"
        })

        generateOTP.save()


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
                subject: `Hey ${name} Welcome 👋`,
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
<td style="background-color: #000000; color: #ffffff; font-size: 2rem; font-weight: bold; padding: 2rem; text-align: center;">Hey! ${name} welcome 👋</td>
</tr>
<tr>
<td style="padding: 2rem;">
  <p style="font-size: 1rem;">Thankyou for joining our brand new social media platform.</p>
  <div style="margin-top: 2rem;">
    <div style="font-size: 0.8rem;">Please use this OTP to verify your email</div>
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
            "authToken": authToken
        })

    } catch (error) {
        console.error(error.message);
        res.send("Internal Server Error");
    }
})

router.post('/authuser', [
    body('email', 'Enter a valid e-mail').isEmail(),
    body('password', 'password cannot be empty').exists()
], async (req, res) => {

    const otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false
    });

    let success = false;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.json({ errors: errors.array() })
    }

    const { email, password } = req.body;

    try {

        let userData = await User.findOne({ email: email })

        if (!userData) {
            return res.send({ "error": "invalid credentials" })
        }

        const passCompare = await bcrypt.compare(password, userData.password)

        if (!passCompare) {
            return res.send({ "error": "invalid credentials" })
        }

        if (userData.isBanned) {
            return res.send({ "error": "You are Permanently Banned" })
        }

        const data = {
            userData: {
                id: userData.id
            }
        }

        const authToken = jwt.sign(data, jwtSecret)

        if (!userData.isAuth) {

            const otpValidate = await Otp.findOne({ "userID": data.userData.id, "type": "auth" })

            if (otpValidate) {
                return res.send({ "error": "OTP already exists" })
            }

            const generateOTP = Otp({
                "userID": data.userData.id,
                "OTP": otp,
                "type": "auth"
            })

            generateOTP.save()

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
                    subject: `Hey ${userData.name} verify your Email`,
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
    <td style="background-color: #000000; color: #ffffff; font-size: 2rem; font-weight: bold; padding: 2rem; text-align: center;">hey! ${userData.name} verify your email</td>
  </tr>
  <tr>
    <td style="padding: 2rem;">
      <p style="font-size: 1rem;">Thankyou for joining our brand new social media platform.</p>
      <div style="margin-top: 2rem;">
        <div style="font-size: 0.8rem;">Please use this OTP to verify your email</div>
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

            return res.send({ "validateAuth": true, "authToken": authToken, "message": "Please Validate OTP" })

        }

        success = true;
        res.json({ success, authToken })

    } catch (error) {
        console.error(error);
        res.send("Internal Server Error");
    }

})

router.post('/change-password', fetchUser, async (req, res) => {

    try {

        const sessionUserID = req.user.id;

        const { password, newPassword } = req.body;

        const userVerification = await User.findOne({
            _id: sessionUserID
        })

        if (!userVerification) {
            return res.send({ "error": "404 user not found" })
        }

        const passCompare = await bcrypt.compare(password, userVerification.password)

        if (!passCompare) {
            return res.send({ "error": "Invalid Current Password" })
        }

        const salt = await bcrypt.genSalt(10)
        const secPass = await bcrypt.hash(newPassword, salt);

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
                subject: `Hey ${userVerification.name} verify your Email`,
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
<td style="background-color: #000000; color: #ffffff; font-size: 2rem; font-weight: bold; padding: 2rem; text-align: center;">hey! ${userVerification.name} </td>
</tr>
<tr>
<td style="padding: 2rem;">
  <p style="font-size: 1rem;">Your password is updated succesfully now you can use your new password to login.</p>
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
            "message": "Password Updated Successfully"
        })

    } catch (error) {
        console.log(error.message);
        res.send("Internal Server Error");
    }

})


module.exports = router;