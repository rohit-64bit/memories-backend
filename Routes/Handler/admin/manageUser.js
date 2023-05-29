const express = require('express');
const fetchAdmin = require('../../../Middleware/fetchAdmin');
const User = require('../../../Models/User');
const Verification = require('../../../Models/Verification');
const BlackList = require('../../../Models/BlackList');
const Notification = require('../../../Models/Notification');
const router = express.Router();

router.post('/fetch-all-users/:page', fetchAdmin, async (req, res) => {

    try {

        const page = Number(req.params.page);

        const limit = 6;

        const offset = (page - 1) * limit;

        const user = await User.find().sort({ _id: -1 }).skip(offset).limit(limit).exec()

        const totalUser = await User.find()

        res.send({ "user": user, "totalUser": totalUser.length })

    } catch (error) {

        console.log(error.message)
        res.send({ "error": "Internal Server Error" })

    }

})


router.post('/get-user-profile', fetchAdmin, async (req, res) => {

    try {

        const { userID } = req.body;

        const user = await User.findById(userID)

        if (user.isPartner) {

            const partner = await Verification.findOne({ "userID": userID })

            return res.send({ user, partner })

        }

        res.send({ user })

    } catch (error) {

        console.log(error.message)
        res.send({ error: 'Internal Server Error' })

    }

})


router.post('/ban-unban-user', fetchAdmin, async (req, res) => {

    try {

        const { userID, isPermanentBan } = req.body;

        const validateUser = await User.findById(userID)

        if (!validateUser) {
            return res.send({ "error": "404 - User Not Found" })
        }

        if (isPermanentBan) {

            if (validateUser.isBanned) {

                validateUser.isBanned = false
                await validateUser.save()


                return res.send({ "success": true, "message": "User Unbanned" })
            }

            validateUser.isBanned = true;
            await validateUser.save()

            return res.send({ "success": true, "message": "User Parmanently Banned" })

        } else if (!isPermanentBan) {

            const validateTempBan = await BlackList.findOne({ "userID": userID })

            if (validateTempBan) {
                return res.send({ "error": "User has a existing ban" })
            }

            const tempBan = BlackList({ "userID": userID })
            await tempBan.save()

            const notification = Notification({

                "interaction": false,
                "userID": userID,
                "notificationText": "You are temporarily banned by the admin for 5 hours."

            })

            await notification.save()

            res.send({ "success": true, "message": "User Temporarily Banned" })

        } else {
            res.send({ "error": "Something Went Wrong" })
        }

    } catch (error) {

        console.log(error.message)
        res.send({ "error": "Internal Server Error" })

    }

})


module.exports = router;