
const bcrypt = require('bcryptjs');
const config = require('../config/auth.config');
const axios = require('axios');
const credentials = require('../config/credentials.json');
const jwt = require('jsonwebtoken')

const verifyPeripheralBodyMaxLength = (req,res,next) => {
    var type,brand,model,serialNumber,employeeName,employeeEmail,employeeSerial,comment,date = "";
    type=type+req.body.type;
    brand+=req.body.brand;
    model+=req.body.model;
    serialNumber+=req.body.serialNumber;
    employeeName+=req.body.employeeName;
    employeeEmail+=req.body.employeeEmail;
    employeeEmail=employeeEmail.toLowerCase();
    employeeSerial+=req.body.employeeSerial;
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
    email=email.toLowerCase();
    serial+=req.body.serial;
    area+=req.body.area;
    mngrName+=req.body.mngrName;
    mngrEmail+=req.body.mngrEmail;
    mngrEmail=mngrEmail.toLowerCase()
    if(name.length > 60) {
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
    employeeEmail=employeeEmail.toLowerCase();
    employeeSerial+=req.body.employeeSerial
    comment+=req.body.comment;
    date+=req.body.date;
    var userQuery=""+type+brand+model+serialNumber+employeeName+employeeEmail+employeeSerial+comment+date;
    
    if(!userQuery.match(onlyAllowedPattern)){
        return res.status(400).json({ message: "No special characters, please!"})
    }else{
        next();
    }
    
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
    mngrEmail=mngrEmail.toLowerCase();
    var userQuery=name+email+serial+area+mngrName+mngrEmail; 
    
    if(!userQuery.match(onlyAllowedPattern)){
      return res.status(400).json({ message: "No special characters, please!"})
    }else{
        next();
    }
    
}

const verifySerialNumberNotDuplicated = (req,res,next) => {
    var {serialNumber} = req.body;

    const token = req.body.bearerToken
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

}

const verifyEmailNotDuplicated = (req,res,next) => {
    var {email} = req.body;

    const token = req.body.bearerToken
    const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
    const queryData = {
        "commands":`SELECT COUNT "EMAIL" FROM "SNT24490"."USERS" WHERE "EMAIL" = '${email}';`,//modificar "query data" con el query SQL
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
                            return res.json({message:"Email already registered"})
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

}

const verifyPeripheralType = (req,res,next) => {
    const {type} = req.body;
    const validTypes = [
        'Monitor',
        'Mouse',
        'Keyboard',
        'Headset',
        'Adapter',
        'Computer',
        'Tablet',
        'Laptop',
        'Touchscreen RB Pi',
        'Camera / Webcam',
        'Personal labeler',
        'OTP Hardware',
        'Mobile Phone',
        'Virtual Assistant',
        'Trackpad',
        'Power Adapter / Charger',
        'Apple TV',
        'Articulating Mount',
        'HDD / SSD',
        'HDMI Cable',
        'USB-C Charge cable',
        'USB Memory',
        'Combo Keyboard Mouse',
        'Multiport Adapter',
        'Video Adapter',
        'Docking Station',
        'Others',
      ]

    if(!validTypes.includes(type)){
        return res.status(400).json({message: "Valid Peripheral Types only!"})
    }else{
        next();
    }

}

const verifyInput = {
    verifyPeripheralBodyMaxLength:verifyPeripheralBodyMaxLength,
    verifyUserBodyMaxLength:verifyUserBodyMaxLength,
    verifyNoSQLInjection:verifyNoSQLInjection,
    verifyNoAuthSQLInjection:verifyNoAuthSQLInjection,
    verifySerialNumberNotDuplicated:verifySerialNumberNotDuplicated,
    verifyPeripheralType:verifyPeripheralType,
    verifyEmailNotDuplicated:verifyEmailNotDuplicated
};

module.exports = verifyInput;