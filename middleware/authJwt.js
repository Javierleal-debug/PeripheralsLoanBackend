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
const verifyToken = (req, res, next) => {
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

const isFocal = (req,res,next) => {//implementar funcion que revisa si el token recibido es de un focal
    let token = req.headers["x-access-token"];

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(403).send({
                message:"Invalid Token"
            });
        }else{
            if(decoded.userType==1){ // el 1 significa focal user
                console.log("Is Focal");
                next();
            }else{
                console.log("Focal User Required")
                return res.status(403).send({
                    message:"User Can't Use This Function"
                });
            }
            
        }
    })
}

const isSecurity = (req,res,next) => { //implementar funcion que revisa si el token recibido es de un security
    let token = req.headers["x-access-token"];

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(403).send({
                message:"Invalid Token"
            });
        }else{
            if(decoded.userType==2){//el 2 significa security user
                console.log("Is Focal");
                next();
            }else{
                console.log("Focal User Required")
                return res.status(403).send({
                    message:"User Can't Use This Function"
                });
            }
            
        }
    })
}

const authJwt = {
    hasToken:hasToken,
    verifyToken:verifyToken,
    isFocal:isFocal,
    isSecurity:isSecurity
};

module.exports = authJwt;