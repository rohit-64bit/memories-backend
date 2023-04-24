const express = require('express')
const connectToMongo = require('./Config/db')
const cors = require('cors')
require('dotenv').config()
const env = process.env;

connectToMongo()

const app = express();
const port = process.env.PORT || 8888;

app.use(cors({ origin: [`${env.CLIENT_URL}`] }))

app.use(express.json())


app.use('/api/auth/user', require('./Routes/Auth/userAuth'))

app.use('/api/auth/admin', require('./Routes/Auth/adminAuth'))

app.use('/api/otp', require('./Routes/Auth/otpVerification'))

app.use('/api/forgot-password', require('./Routes/Auth/forgetPassword'))

app.use('/api/user', require('./Routes/Handler/UserProfile'))

app.use('/api/verification', require('./Routes/Handler/manageVerification'))

app.use('/api/blacklist', require('./Routes/Handler/manageBlacklist'))

app.use('/api/follow', require('./Routes/Handler/manageFollow'))

app.use('/api/post', require('./Routes/Handler/managePost'))

app.use('/api/like', require('./Routes/Handler/manageLike'))

app.use('/api/comment', require('./Routes/Handler/manageComment'))


app.get('/', (req, res) => {
    res.send(`<a href=${env.CLIENT_URL}> Visit Site </a>`)
})

app.listen(port, () => {
    console.log(`Backend running at http://localhost:${port}`);
})