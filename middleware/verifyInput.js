
const bcrypt = require('bcryptjs');
const config = require('../config/auth.config');
const axios = require('axios');
const credentials = require('../config/credentials.json');
const jwt = require('jsonwebtoken')

const authUrl = 'https://iam.cloud.ibm.com/identity/token'; 
const authData = `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${ credentials.ApiKey }`;
const authConf = {
    Headers: {
        "Content-Type": "application/x-www-form-urlencoded"
    }
};

const verifySignup = (req,res,next) => {
    next();
}

const verifyPeripheralBodyMaxLength = (req,res,next) => {
    var type,brand,model,serialNumber,employeeName,employeeEmail,employeeSerial,comment,date = "";
    type=type+req.body.type;
    brand+=req.body.brand;
    model+=req.body.model;
    serialNumber+=req.body.serialNumber;
    employeeName+=req.body.employeeName;
    employeeEmail+=req.body.employeeEmail;
    employeeSerial+=req.body.employeeSerial
    comment+=req.body.comment;
    date+=req.body.date;
    if(type.length > 50) {
        return res.json({message:"Invalid peripheral type length(max 50)"});
    } else if (brand.length > 50) {
        return res.json({message:"Invalid peripheral brand length(max 50)"});
    } else if (model.length > 50) {
        return res.json({message:"Invalid peripheral model length(max 50)"});
    } else if (serialNumber.length > 100) {
        return res.json({message:"Invalid peripheral serialNumber length(max 100)"});
    } else if (employeeName.length > 60) {
        return res.json({message:"Invalid employeeName length(max 60)"});
    } else if (employeeEmail.length > 254) {
        return res.json({message:"Invalid employeeEmail length(max 254)"});
    } else if (employeeSerial.length > 100) {
        return res.json({message:"Invalid employeeSerial length(max 100)"});
    } else if (comment.length > 254) {
        return res.json({message:"Invalid comment length(max 254)"});
    } else if (date.length > 10) {
        return res.json({message:"Invalid date length(max 10)"});
    } else{
        next();
    }
}

const verifyUserBodyMaxLength = (req,res,next) => {
    var name,email,serial,area,mngrName,mngrEmail = "";
    name+=req.body.name;
    email+=req.body.email;
    serial+=req.body.serial;
    area+=req.body.area;
    mngrName+=req.body.mngrName;
    mngrEmail+=req.body.mngrEmail;
    if(req.body.name > 60) {
        return res.json({message:"Invalid User Name length(max 60)"})
    } else if(email.length > 254) {
        return res.json({message:"Invalid User Email length(max 254)"})
    } else if(serial.length > 100) {
        return res.json({message:"Invalid User Serial length(max 100)"})
    } else if(area.length > 50) {
        return res.json({message:"Invalid User Area length(max 50)"})
    } else if(mngrName.length > 60) {
        return res.json({message:"Invalid Manager Name length(max 60)"})
    } else if(mngrEmail.length > 254) {
        return res.json({message:"Invalid Manager Email length(max 254)"})
    } else {
        next();
    }
}

const verifyNoSQLInjection = (req,res,next) => {
    const onlyAllowedPattern = /^[-.@_A-Za-z0-9 ]+$/;
    var type,brand,model,serialNumber,employeeName,employeeEmail,employeeSerial,comment,date = "";
    type=type+req.body.type;
    brand+=req.body.brand;
    model+=req.body.model;
    serialNumber+=req.body.serialNumber;
    employeeName+=req.body.employeeName;
    employeeEmail+=req.body.employeeEmail;
    employeeSerial+=req.body.employeeSerial
    comment+=req.body.comment;
    date+=req.body.date;
    var userQuery=""+type+brand+model+serialNumber+employeeName+employeeEmail+employeeSerial+comment+date;
    
    if(!userQuery.match(onlyAllowedPattern)){
      return res.status(400).json({ message: "No special characters, please!"})
    }
    next();
}
const verifyNoAuthSQLInjection = (req,res,next) => {
    const onlyAllowedPattern = /^[-.@_A-Za-z0-9 ]+$/;
    var name,email,serial,area,mngrName,mngrEmail = "";
    name+=req.body.name;
    email+=req.body.email;
    serial+=req.body.serial;
    area+=req.body.area;
    mngrName+=req.body.mngrName;
    mngrEmail+=req.body.mngrEmail;
    var userQuery=name+email+serial+area+mngrName+mngrEmail; 
    
    if(!userQuery.match(onlyAllowedPattern)){
      return res.status(400).json({ message: "No special characters, please!"})
    }
    next();
}

const verifySerialNumberNotDuplicated = (req,res,next) => {
    var {serialNumber} = req.body;
    axios.post( authUrl, authData, authConf )
    .then( response => {
        // Making query
        const token = response.data.access_token
        const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
        const queryData = {
            "commands":`SELECT COUNT "SERIALNUMBER" FROM "SNT24490"."PERIPHERAL" WHERE "SERIALNUMBER"='${serialNumber}' AND "HIDDEN"=false;`,//modificar "query data" con el query SQL
            "limit":10,
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
                            console.log(response.data.results[0])
                            if(response.data.results[0].rows[0][0]>0){
                                return res.json({message:"SerialNumber is already registered"})
                            }else{
                                next();
                            }
                        }
                    } catch(error){
                        console.error(error);//errorHandling
                        return res.status(404).json({message:error})
                    }
                })
        })            
    });
}

const verifyInput = {
    verifySignup:verifySignup,
    verifyPeripheralBodyMaxLength:verifyPeripheralBodyMaxLength,
    verifyUserBodyMaxLength:verifyUserBodyMaxLength,
    verifyNoSQLInjection:verifyNoSQLInjection,
    verifyNoAuthSQLInjection:verifyNoAuthSQLInjection,
    verifySerialNumberNotDuplicated:verifySerialNumberNotDuplicated
};

module.exports = verifyInput;