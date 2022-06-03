const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');
const axios = require('axios')
const credentials = require('../config/credentials.json')

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

const isAdmin = (req,res,next) => {//implementar funcion que revisa si el token recibido es de un focal
    let token = req.headers["x-access-token"];

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(403).send({
                message:"Invalid Token"
            });
        }else{
            if(decoded.userType==0){ // el 1 significa focal user y 0 admin
                console.log("Is Admin");
                next();
            }else{
                console.log("Admin User Required")
                return res.status(403).send({
                    message:"User Can't Use This Function"
                });
            }
            
        }
    })
}

const isFocal = (req,res,next) => {//implementar funcion que revisa si el token recibido es de un focal
    let token = req.headers["x-access-token"];

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(403).send({
                message:"Invalid Token"
            });
        }else{
            if(decoded.userType==1 || decoded.userType==0){ // el 1 significa focal user y 0 admin
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
            if(decoded.userType==2 || decoded.userType==0){//el 2 significa security usery 0 admin
                console.log("Is Security");
                next();
            }else{
                console.log("Security User Required")
                return res.status(403).send({
                    message:"User Can't Use This Function"
                });
            }
            
        }
    })
}

const correctPassword = (req,res,next) => {
    const {employeeEmail,pwd} = req.body;
    const token = req.body.bearerToken;
    const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
    const queryData = {
        "commands":`SELECT "PASSWORD" FROM "SNT24490"."USERS" WHERE "EMAIL"='${employeeEmail}';`,//modificar "query data" con el query SQL
        "limit":100000,
        "separator":";",
        "stop_on_error":"yes"
    }
    const queryConf = {
        headers: {
            "authorization": `Bearer ${token}`,
            "csontent-Type": 'application/json',
            "x-deployment-id": credentials.DB_DEPLOYMENT_ID
        }
    }
    axios.post(queryURL,queryData,queryConf)
    .then(response => {
        const getDataUrl = `${queryURL}/${response.data.id}`
        axios.get(getDataUrl,queryConf)
            .then(response => {
                try{
                    if(response.data.results[0].error){
                        console.log(response.data.results[0])
                        return res.json({message:response.data.results[0].error})
                    }else{
                        console.log(response.data.results[0].rows[0][0])
                        var passwordIsValid = bcrypt.compareSync(
                            pwd,
                            response.data.results[0].rows[0][0]
                        );
                
                        if (!passwordIsValid) {
                            return res.status(401).send({message:"Invalid Password Contact an Admin for help"});
                        }
                        console.log(response.data.results[0])
                        next();
                    }
                } catch(error){
                    console.error(error);//errorHandling
                    return res.status(404).json({message:error})
                }
            })
    })            

}

const authJwt = {
    hasToken:hasToken,
    verifyToken:verifyToken,
    isAdmin:isAdmin,
    isFocal:isFocal,
    isSecurity:isSecurity,
    correctPassword:correctPassword
};

module.exports = authJwt;