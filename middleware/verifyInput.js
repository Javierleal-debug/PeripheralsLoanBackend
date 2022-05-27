
const bcrypt = require('bcryptjs');

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
    next();
}



const verifyInput = {
    verifySignup:verifySignup,
    verifyPeripheralBodyMaxLength:verifyPeripheralBodyMaxLength,
    verifyUserBodyMaxLength:verifyUserBodyMaxLength,
    verifyNoSQLInjection:verifyNoSQLInjection
};

module.exports = verifyInput;