const express = require('express');
const router = express.Router();
const Otp = require('../../Models/Otp');
const fetchUser = require('../../Middleware/fetchUser');
const User = require('../../Models/User');
const otpGenerator = require('otp-generator')


// router.post('/create', fetchUser, async (req, res) => {

//     const otp = otpGenerator.generate(6, {
//         upperCaseAlphabets: false,
//         specialChars: false,
//         lowerCaseAlphabets: false
//     });

//     try {

//         const userID = req.user.id

//         const userVerify = await User.findById(userID)

//         if (!userVerify) {
//             return res.send({ "error": "no user found" })
//         }

//         const otpValidate = await Otp.findOne({ "userID": userID })

//         if (otpValidate) {
//             return res.send({ "error": "otp already exists" })
//         }

//         const data = Otp({
//             "userID": userID,
//             "OTP": otp,
//             "type": "reset"
//         })

//         const saveOTP = await data.save()

//         // send a email to the user with otp

//         res.json({
//             "success": true,
//             "message": "otp generated"
//         })

//     } catch (error) {
//         console.error(error.message);
//         res.send({ error: "Internal Server Error" });
//     }

// })

router.post('/verify', fetchUser, async (req, res) => {

    try {

        const { otp, type } = req.body

        const sessionUserID = req.user.id

        const userData = await User.findById(sessionUserID).exec()

        const otpData = await Otp.findOne({
            "userID": sessionUserID,
            "type": "auth"
        })

        if (!otpData) {
            return res.send({ error: "Otp Not Exist !" })
        }

        if (Number(otp) === otpData.OTP) {

            if (otpData.type === "auth") {

                userData.isAuth = true
                await userData.save()

            }

            return res.json({
                success: true,
                message: "otp validated !",
                type: otpData.type
            })

        }

    } catch (error) {
        console.log(error.message)
        res.send("Internal Server Error");
    }

})


module.exports = router;