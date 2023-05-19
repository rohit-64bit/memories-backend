const express = require('express')
const connectToMongo = require('./Config/db')
const cors = require('cors')
require('dotenv').config()
const env = process.env;

const { Server } = require('socket.io');

connectToMongo()

const app = express();
const port = process.env.PORT || 8888;

const socketPort = 9000;

const server = require('http').createServer(app);

const allowedOrigin = [
    `${env.CLIENT_URL}`,
    `${env.PERMANENT_CLIENT_URL}`
]

app.use(cors({ origin: allowedOrigin }))

app.use(express.json())

// apis used for analytics and health

app.use('/api/health', require('./Routes/Analytics/manageHealth'))
app.use('/api/analytics', require('./Routes/Analytics/manageAnalytics'))

// ----------------------------------


app.use('/api/auth/user', require('./Routes/Auth/userAuth'))

app.use('/api/auth/admin', require('./Routes/Auth/adminAuth'))

app.use('/api/otp', require('./Routes/Auth/otpVerification'))

app.use('/api/forgot-password', require('./Routes/Auth/forgetPassword'))

app.use('/api/user', require('./Routes/Handler/UserProfile'))

app.use('/api/verification', require('./Routes/Handler/manageVerification'))

app.use('/api/follow', require('./Routes/Handler/manageFollow'))

app.use('/api/post', require('./Routes/Handler/managePost'))

app.use('/api/like', require('./Routes/Handler/manageLike'))

app.use('/api/comment', require('./Routes/Handler/manageComment'))

app.use('/api/search', require('./Routes/Handler/manageSearch'))

app.use('/api/report', require('./Routes/Handler/manageReport'))

app.use('/api/notification', require('./Routes/Handler/manageNotification'))

app.use('/api/blacklist', require('./Routes/Handler/admin/manageBlacklist'))

app.use('/api/chat', require('./Routes/Handler/manageChat'))



// admin routes

app.use('/api/admin/manage-user', require('./Routes/Handler/admin/manageUser'))



app.get('/', (req, res) => {
    res.send(`<a href=${env.CLIENT_URL}> Visit Site </a>`)
})

// app.listen(port, () => {
//     console.log(`Backend running at ${port} port`);
// })

// Socket handlers

const io = new Server(server, {
    cors: {
        origin: `${env.CLIENT_URL}`,
    }
});

io.on("connection", (socket) => {

    socket.on("setup", (user) => {

        socket.join(user._id)

        io.emit("connected")

    })

    socket.on("join-chat", (room) => {
        socket.join(room)
    })

    socket.on('typing', (room) => {
        io.in(room).emit('typing')
    })

    socket.on('stop-typing', (room) => {
        io.in(room).emit('stop-typing')
    })

    socket.on('message', (payload) => {

        const roomID = payload.chatID

        if (!roomID) {
            return console.log("ChatID badly formated")
        }

        io.in(roomID).emit('message', payload)

    })

})

server.listen(port, () => {

    console.log(`IO & API Server running at ${port} port`);

})