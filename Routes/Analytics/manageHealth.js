const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        
        res.status(200).send({ success: "Server is healthy" })

    } catch (error) {
        console.log(error)
        res.status(500).send({ error: "Internal Server Error" })
    }
})

module.exports = router