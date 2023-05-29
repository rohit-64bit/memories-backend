const express = require('express');
const fetchAdmin = require('../../../Middleware/fetchAdmin');
const Partner = require('../../../Models/Partner');
const Verification = require('../../../Models/Verification');
const Notification = require('../../../Models/Notification');
const router = express.Router();

router.post('/fetch-application/:page', fetchAdmin, async (req, res) => {

    try {

        const page = Number(req.params.page);

        const limit = 6;

        const offset = (page - 1) * limit;

        const applications = await Partner.find({ pendingStatus: true }).sort({ _id: -1 }).skip(offset).limit(limit).exec()

        const allApplication = await Partner.find({ pendingStatus: true })

        res.send({ applications, allApplication: allApplication.length })

    } catch (error) {
        console.log(error.message)
        res.send({ error: "Internal Server Error" })
    }

})

router.post('/terminate-reject-partner', fetchAdmin, async (req, res) => {

    try {

        const { applicationID, userID, reason } = req.body

        const application = await Partner.findById(applicationID)

        const validatePartner = await Verification.findOne({ userID: userID })

        if (validatePartner) {

            validatePartner.isTerminated = true
            validatePartner.terminationReason = reason

            await validatePartner.save()

            const notification = Notification({

                "interaction": false,
                "userID": userID,
                "notificationText": `Partnership terminated due to ${reason}. Contact admins for details`

            })

            await notification.save()

            return res.send({ success: true, message: "Partnership Terminated" })

        }

        if (!application) {
            return res.send({ error: "404 - application not found" })
        }

        await Partner.findByIdAndDelete(applicationID)

        const notification = Notification({

            "interaction": false,
            "userID": userID,
            "notificationText": `Partnership application has been rejected due to ${reason}. You can reapply any time.`

        })

        await notification.save()

        return res.send({ success: true, message: "Partnership Application Rejected" })

    } catch (error) {
        console.log(error)
        res.send({ error: "Internal Server Error" })
    }

})

module.exports = router;