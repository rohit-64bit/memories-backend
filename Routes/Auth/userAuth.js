const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require("../../Models/User")
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fetchUser = require('../../Middleware/fetchUser');
const Otp = require('../../Models/Otp');
const otpGenerator = require('otp-generator')

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
            "OTP": otp
        })

        generateOTP.save()

        // send a welcome email to the user

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

        const data = {
            userData: {
                id: userData.id
            }
        }

        const authToken = jwt.sign(data, jwtSecret)

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

        // send a info type email with message of password update

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