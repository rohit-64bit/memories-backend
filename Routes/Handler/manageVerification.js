const express = require('express');
const router = express.Router();
const fetchAdmin = require('../../Middleware/fetchAdmin');
const Verification = require('../../Models/Verification');
const fetchUser = require('../../Middleware/fetchUser');

router.post('/manage-verification', fetchAdmin, async (req, res) => {

    try {

        const { userID, verificationType } = req.body;

        const verificationValidate = await Verification.findOne({ "userID": userID })

        const verificationID = verificationValidate._id

        if (verificationValidate === null) {

            const data = Verification({
                "userID": userID,
                "verificationType": verificationType
            })

            const newVerification = await data.save()

            return res.send({ "success": "User has given a badge" })

        }

        const newData = {}

        if (verificationType) {
            newData.verificationType = verificationType
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