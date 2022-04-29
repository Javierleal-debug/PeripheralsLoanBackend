const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');

const hasToken = (req,res,next) =>{
    let token = req.headers["x-access-token"];

    if (!token) {
        return res.status(403).send({
            message: "No token provided"
        });
    }
    
    next();
}
const verifyToken =(req, res, next) => {
    let token = req.headers["x-access-token"];

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(403).send({
                message:"Unauthorized user"
            });
            
        }else{
            next();
        }
    })
};

const authJwt = {
    hasToken:hasToken,
    verifyToken:verifyToken
};

module.exports = authJwt;