const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Admin = require("../../Models/Admin")
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fetchAdmin = require('../../Middleware/fetchAdmin');


require('dotenv').config()
const env = process.env;

const jwtSecret = env.JWT_SECRET_ADMIN;

router.post('/createadmin', [
    body('email', 'Enter a valid e-mail').isEmail(),
    body('password', 'Password must be atleast 8 characters').isLength({ min: 8 })
], async (req, res) => {

    const { email, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        let admin = await Admin.findOne({ email: req.body.email });

        if (admin) {
            return res.send({ "error": 'Sorry A admin already exists login insted' })
        }

        const salt = await bcrypt.genSalt(10)
        const secPass = await bcrypt.hash(req.body.password, salt);

        const adminData = await Admin.create({
            email: req.body.email,
            password: secPass
        })

        const data = {
            adminData: {
                id: adminData.id
            }
        }

        const authToken = jwt.sign(data, jwtSecret);

        // send a welcome email to the admin

        res.json({ authToken })

    } catch (error) {
        console.error(error.message);
        res.send("Internal Server Error");
    }
})

router.post('/authadmin', [
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

        let admin = await Admin.findOne({ email: email })

        if (!admin) {
            return res.send({ "error": "invalid credentials" })
        }

        const passCompare = await bcrypt.compare(password, admin.password)

        if (!passCompare) {
            return res.send({ "error": "invalid credentials" })
        }

        const data = {
            admin: {
                id: admin.id
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

router.post('/change-password', fetchAdmin, async (req, res) => {

    try {

        const sessionAdminID = req.admin.id;

        const { password, newPassword } = req.body;

        const adminVerification = await Admin.findOne({
            _id: sessionAdminID
        })

        if (!adminVerification) {
            return res.send({ "error": "404 admin not found" })
        }

        const passCompare = await bcrypt.compare(password, adminVerification.password)

        if (!passCompare) {
            return res.send({ "error": "Invalid Credentials" })
        }

        const salt = await bcrypt.genSalt(10)
        const secPass = await bcrypt.hash(newPassword, salt);

        const updateAdminPassword = await Admin.findByIdAndUpdate(sessionAdminID, { password: secPass }, { new: true })

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