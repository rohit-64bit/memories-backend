const jwt = require('jsonwebtoken');
require('dotenv').config()
const env = process.env;

const jwtSecret = env.JWT_SECRET_USER;

const fetchUser = async (req, res, next) => {

    try {

        const token = req.header('auth-token');

        if (!token) {
            return res.send({ "error": "Please authenticate using a valid token" });
        }

        const data = jwt.verify(token, jwtSecret);
        req.user = data.userData;
        next();
    } catch (error) {
        console.log(error.message);
        res.send({ "error": "Something went wrong" });
    }

}

module.exports = fetchUser;