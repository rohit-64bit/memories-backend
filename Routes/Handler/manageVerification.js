const express = require('express');
const router = express.Router();
const fetchAdmin = require('../../Middleware/fetchAdmin');
const Verification = require('../../Models/Verification');
const fetchUser = require('../../Middleware/fetchUser');
const User = require('../../Models/User');
const Partner = require('../../Models/Partner');

router.post('/apply', fetchUser, async (req, res) => {

    try {

        const payload = req.body

        const validatePartner = await Partner.findOne({ userID: payload.userID })

        if (validatePartner) {
            return res.send({ "error": "You have already applied" })
        }

        const data = Partner(payload)

        await data.save()

        res.send({ "success": true, "message": "Application Submited" })

    } catch (error) {

        console.log(error.message)
        res.send({ error: "Internal Server Error" })

    }

})

router.post('/fetch-status', fetchUser, async (req, res) => {

    try {

        const sessionUserID = req.user.id

        const validatePartner = await Partner.findOne({ userID: sessionUserID })

        if (!validatePartner) {
            return res.send({ "notFound": true })
        }

        res.send(validatePartner)

    } catch (error) {
        console.log(error.message)
        res.send({ error: "Internal Server Error" })
    }

})

router.post('/manage-verification', fetchAdmin, async (req, res) => {

    try {

        const { userID, verificationType, isPartner } = req.body;

        const verificationValidate = await Verification.findOne({ "userID": userID })

        const user = await User.findById(userID)

        const verificationID = verificationValidate._id

        if (verificationValidate === null) {

            const data = Verification({
                "userID": userID,
                "verificationType": verificationType
            })

            const newVerification = await data.save()

            const updateUserPartnerStatus = User({
                "isPartner": true
            })

            const updateStatus = await updateUserPartnerStatus.save()

            return res.send({ "success": "User has given a badge" })

        }

        const newData = {}

        if (verificationType) {
            newData.verificationType = verificationType
        }

        if (isPartner) {
            newData.isPartner = isPartner
        }

        const editVerification = await Verification.findByIdAndUpdate(verificationID, { $set: newData }, { new: true })

        res.send({ "success": "Badge Update Success" })

    } catch (error) {
        console.log(error.message);
        res.send({ "error": "Internal Server Error" })
    }

})

router.get('/user/fetch-verification', fetchUser, async (req, res) => {

    const sessionUserID = req.user.id;

    try {

        const { userID } = req.body;


        if (sessionUserID != null) {

            const verificationStatus = await Verification.findOne({ "userID": sessionUserID })

            return res.send({
                "success": true,
                "badge": verificationStatus.verificationType
            })

        }

        // if (sessionAdminID != null) {

        //     const verificationStatus = await Verification.findOne({ "userID": userID })
        //     return res.send({
        //         "success": true,
        //         "badge": verificationStatus.verificationType
        //     })

        // }

    } catch (error) {
        console.log(error.message);
        res.send({ "error": "Internal Server Error" })
    }

})

router.get('/admin/fetch-verification', fetchAdmin, async (req, res) => {

    try {

        const { userID } = req.body;

        const verificationStatus = await Verification.findOne({ "userID": userID })

        if (!verificationStatus) {
            res.send({ "error": "Badge is not available" })
        }

        return res.send({
            "success": true,
            "badge": verificationStatus.verificationType
        })


    } catch (error) {
        console.log(error.message);
        res.send({ "error": "Internal Server Error" })
    }

})

module.exports = router;