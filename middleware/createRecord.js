const config = require('../config/auth.config');
const axios = require('axios');
const credentials = require('../config/credentials.json');
const jwt = require('jsonwebtoken')

module.exports.recordGetInfo = (req,res,next) => {
    var {serialNumber} = req.body;
    if(serialNumber.length<1){
        return res.status(400).json({message:"Please provide the neccesary data"})
    }
    const token = req.body.bearerToken;
    const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
    const queryData = {
        "commands":`SELECT "TYPE", "BRAND", "MODEL", "SERIALNUMBER", "ACCEPTEDCONDITIONS", "ISINSIDE", "SECURITYAUTHORIZATION", "EMPLOYEENAME", "EMPLOYEEEMAIL", "EMPLOYEESERIAL", "EMPLOYEEAREA", "MNGRNAME", "MNGREMAIL", "DATE", "COMMENT"
        FROM "SNT24490"."PERIPHERAL" WHERE "SERIALNUMBER"='${serialNumber}';`,//modificar "query data" con el query SQL
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
                    var device = response.data.results[0].rows[0]
                    console.log(response.data.results[0].rows[0][0])
                    console.log('dispositivo: ' + device)
                    req.body.type=device[0];
                    req.body.brand=device[1];
                    req.body.model=device[2];
                    req.body.serialNumber=device[3];
                    req.body.acceptedConditions=device[4];
                    req.body.isInside=device[5];
                    req.body.securityAuthorization=device[6];
                    req.body.employeeName=device[7];
                    req.body.employeeEmail=device[8];
                    req.body.employeeSerial=device[9];
                    req.body.area=device[10];
                    req.body.mngrName=device[11];
                    req.body.mngrEmail=device[12];
                    req.body.date=device[13];
                    req.body.comment=device[14];
                    next();
                } catch(error){
                    console.error(error);//errorHandling
                }
            })
    })
}

module.exports.createRecord = (req,res) => {
    const {type,brand,model,serialNumber,acceptedConditions,isInside,securityAuthorization,employeeName,employeeEmail,employeeSerial,area,mngrName,mngrEmail,comment,action} = req.body;
    const token = req.body.bearerToken;
    const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
    const queryData = {
        "commands":`INSERT INTO  "SNT24490"."RECORD" ("TYPE","BRAND","MODEL","SERIALNUMBER","ACCEPTEDCONDITIONS","ISINSIDE","SECURITYAUTHORIZATION","EMPLOYEENAME","EMPLOYEEEMAIL","EMPLOYEESERIAL","AREA","MNGRNAME","MNGREMAIL","DATE","ACTIONTYPE","COMMENT")
            VALUES(
        '${type}',                 	--TYPE  VARCHAR(50)  Not null
        '${brand}',                 	--BRAND  VARCHAR(50)  Not null
        '${model}',                 	--MODEL  VARCHAR(50)  Not null
        '${serialNumber}',                 	--SERIALNUMBER  VARCHAR(100)  Not null
        '${acceptedConditions}',                 	--ACCEPTEDCONDITIONS  BOOLEAN(1)  Not null
        '${isInside}',                 	--ISINSIDE  BOOLEAN(1)  Not null
        '${securityAuthorization}',                 	--SECURITYAUTHORIZATION  BOOLEAN(1)  Not null
        '${employeeName}',               	--EMPLOYEENAME  VARCHAR(60)  
        '${employeeEmail}',               	--EMPLOYEEEMAIL  VARCHAR(254)  
        '${employeeSerial}',               	--EMPLOYEESERIAL  VARCHAR(100)  
        '${area}',               	--AREA  VARCHAR(50)  
        '${mngrName}',                 	--MNGRNAME  VARCHAR(60)  Not null
        '${mngrEmail}',                 	--MNGREMAIL  VARCHAR(254)  Not null
        CURRENT TIMESTAMP,  	--DATE  TIMESTAMP(10)  Not null
        '${action}',                 	--ACTIONTYPE  VARCHAR(50)  Not null
        '${comment}'                	--COMMENT  VARCHAR(254)  
        );`,//modificar "query data" con el query SQL
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
                    }else{
                        console.log(response.data.results[0])
                    }
                } catch(error){
                    console.error(error);//errorHandling
                }
            })
    })
}

module.exports.recordsGetInfo = (req,res,next) => {
    const serialNumber = [];
    req.body.array.forEach((i)=>{
        serialNumber.push("'" + i + "'");
    });
    
    const token = req.body.bearerToken;
    const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
    const queryData = {
        "commands":`SELECT "TYPE", "BRAND", "MODEL", "SERIALNUMBER", "ACCEPTEDCONDITIONS", "ISINSIDE", "SECURITYAUTHORIZATION", "EMPLOYEENAME", "EMPLOYEEEMAIL", "EMPLOYEESERIAL", "EMPLOYEEAREA", "MNGRNAME", "MNGREMAIL", "DATE", "COMMENT"
        FROM "SNT24490"."PERIPHERAL" WHERE "SERIALNUMBER" in (${serialNumber});`,//modificar "query data" con el query SQL
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
                    var i = 0 
                    req.body.devices=[]
                    response.data.results[0].rows.forEach((device)=>{
                        let deviceAux = {};
                            deviceAux.type=device[0];
                            deviceAux.brand=device[1];
                            deviceAux.model=device[2];
                            deviceAux.serialNumber=device[3];
                            deviceAux.acceptedConditions=device[4];
                            deviceAux.isInside=device[5];
                            deviceAux.securityAuthorization=device[6];
                            deviceAux.employeeName=device[7];
                            deviceAux.employeeEmail=device[8];
                            deviceAux.employeeSerial=device[9];
                            deviceAux.area=device[10];
                            deviceAux.mngrName=device[11];
                            deviceAux.mngrEmail=device[12];
                            deviceAux.date=device[13];
                            deviceAux.comment=device[14];
                        req.body.devices[i]=deviceAux
                        i++;
                    })
                    next();
                } catch(error){
                    console.error(error);//errorHandling
                }
            })
    })
}

module.exports.createRecords = (req,res) => {
    const {devices, action} = req.body;
    var values = ""

    devices.forEach((device)=>{
        values += `(
            '${device.type}',
            '${device.brand}',
            '${device.model}',
            '${device.serialNumber}',
            '${device.acceptedConditions}',
            '${device.isInside}',
            '${device.securityAuthorization}',
            '${device.employeeName}',
            '${device.employeeEmail}',
            '${device.employeeSerial}',
            '${device.area}',
            '${device.mngrName}',
            '${device.mngrEmail}',
            CURRENT TIMESTAMP,
            '${action}',
            '${device.comment}'
            ),`
    })

    const token = req.body.bearerToken;
    const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
    const queryData = {
        "commands":`INSERT INTO  "SNT24490"."RECORD" ("TYPE","BRAND","MODEL","SERIALNUMBER","ACCEPTEDCONDITIONS","ISINSIDE","SECURITYAUTHORIZATION","EMPLOYEENAME","EMPLOYEEEMAIL","EMPLOYEESERIAL","AREA","MNGRNAME","MNGREMAIL","DATE","ACTIONTYPE","COMMENT")
            VALUES ${values.slice(0, -1)};`,//modificar "query data" con el query SQL
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
                    }else{
                        console.log(response.data.results[0])
                    }
                } catch(error){
                    console.error(error);//errorHandling
                }
            })
    })
}