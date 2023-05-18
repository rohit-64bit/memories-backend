const express = require('express');
const fetchUser = require('../../Middleware/fetchUser');
const Notification = require('../../Models/Notification');
const router = express.Router();

router.post('/fetch-notification/:page', fetchUser, async (req, res) => {

    try {

        const sessionUserID = req.user.id

        const page = Number(req.params.page);

        const limit = 9;

        const offset = (page - 1) * limit;

        const notificationData = await Notification.find({ "userID": sessionUserID }).sort({ _id: -1 }).skip(offset).limit(limit).exec()

        const totalNotificationData = await Notification.find({ "userID": sessionUserID })

        res.send({
            "notificationData": notificationData,
            "totalData": totalNotificationData.length
        })


    } catch (error) {
        console.log(error.message)
        res.send({ "error": "Internal Server Error" })
    }

})

module.exports = router;