const express = require('express');
const fetchUser = require('../../Middleware/fetchUser');
const Chat = require('../../Models/Chat');
const Message = require('../../Models/Message');
const router = express.Router();


router.post('/fetch-chat', fetchUser, async (req, res) => {

    try {

        const sessionUserID = req.user.id

        const { userID } = req.body;

        const validateChat = await Chat.findOne({
            $and: [
                {
                    $or: [
                        { user: { $all: [sessionUserID, userID] } },
                        { user: { $all: [userID, sessionUserID] } }
                    ]
                }
            ]
        })

        if (validateChat) {

            return res.send({ success: true, chatData: validateChat })

        } else {

            const newChat = Chat({ user: [sessionUserID, userID] })

            await newChat.save()

            const chat = await Chat.findOne({
                $and: [
                    {
                        $or: [
                            { user: { $all: [sessionUserID, userID] } },
                            { user: { $all: [userID, sessionUserID] } }
                        ]
                    }
                ]
            })

            res.send({ success: true, chatData: chat })

        }

    } catch (error) {

        console.log(error.message)
        res.send({ error: "Internal Server Error" })

    }

})


router.post('/fetch-all-chat', fetchUser, async (req, res) => {

    try {

        const sessionUserID = req.user.id;

        const chat = await Chat.find({ user: { $in: [sessionUserID] } }).sort({ updatedAt: -1 })

        res.send(chat)

    } catch (error) {
        console.log(error.message)
        res.send({ error: "Internal Server Error" })
    }

})


router.post('/send-message', fetchUser, async (req, res) => {

    try {

        const senderID = req.user.id

        const { message, chatID } = req.body;

        const validateChat = await Chat.findById(chatID)

        if (!validateChat) {
            return res.send({ error: "404 Chat not found" })
        }

        const payload = Message({ message, chatID, senderID })

        await payload.save()

        validateChat.recentMessage = message;
        validateChat.updatedAt = Date.now();
        validateChat.newMessageBy = senderID;
        validateChat.newMessage = true;

        await validateChat.save()

        res.send({ success: true, message: "Message Sent" })

    } catch (error) {
        console.log(error.message)
        res.send({ error: "Internal Server Error" })
    }

})


router.post('/fetch-message', fetchUser, async (req, res) => {

    try {

        const { chatID } = req.body;

        const sessionUserID = req.user.id

        const validateChat = await Chat.findById(chatID)

        if (!validateChat) {
            return res.send({ error: "404 Chat not found" })
        }

        if (validateChat.newMessageBy != sessionUserID) {

            validateChat.newMessage = false

            await validateChat.save()

        }

        const message = await Message.find({ chatID: chatID })

        res.send({ success: true, message: message })

    } catch (error) {
        console.log(error.message)
        res.send({ error: "Internal Server Error" })
    }

})


module.exports = router;