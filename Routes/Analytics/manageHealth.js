const express = require('express');
const router = express.Router();

router.post('/check', async (req, res) => {
    try {

        console.log("Server is healthy");
        res.sendStatus(200).send({ success: "Server is healthy" })

    } catch (error) {
        console.log(error)
        res.sendStatus(500).send({ error: "Internal Server Error" })
    }
})

module.exports = router