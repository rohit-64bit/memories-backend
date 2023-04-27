const express = require('express');
const router = express.Router();
const fetchAdmin = require('../../Middleware/fetchAdmin');
const fetchUser = require('../../Middleware/fetchUser');
const User = require('../../Models/User')

router.post('/search-community/:regex', fetchUser, async (req, res) => {

    try {

        const { regex } = req.params;
        const searchRegex = new RegExp(regex, "i");

        const userList = await User.find({

            $or: [

                { "name": searchRegex },
                { "userName": searchRegex }

            ]

        }).sort({ _id: -1 }).exec()

        const success = true

        res.send({ success, userList })

    } catch (error) {
        console.log(error)
        res.send({ "error": "Internal Server Error" })
    }

})


module.exports = router;