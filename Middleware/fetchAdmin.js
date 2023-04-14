const jwt = require('jsonwebtoken');
require('dotenv').config()
const env = process.env;

const jwtSecret = env.JWT_SECRET_ADMIN;

const fetchAdmin = (req, res, next) => {

    const token = req.header('admin-auth-token');
    if (!token) {
        res.json({ "error": "Please authenticate using a valid token" });
    }
    try {
        const data = jwt.verify(token, jwtSecret);
        req.admin = data.admin;
        next();
    } catch (error) {
        console.log(error.message);
        res.json({ "error": "Something ent wrong" });
    }

}

module.exports = fetchAdmin;