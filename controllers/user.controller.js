const jwt = require('jsonwebtoken');
const axios = require('axios');
const credentials = require('../config/credentials.json');
const config = require('../config/auth.config');
const bcrypt = require('bcryptjs');


module.exports.createUser = (req,res) => {
    const employeeName = req.body.name;
    const employeeEmail = req.body.email;
    const employeeSerial = req.body.serial;
    const employeeArea = req.body.area;
    const mngrName = req.body.mngrName;
    const mngrEmail = req.body.mngrEmail;
    const pwd=bcrypt.hashSync(req.body.pwd,8);
    const usertypeid=req.body.userTypeId;

    var adminToken = req.headers['x-access-token'];
    jwt.verify(adminToken,config.secret, (err,decoded) => {
        const token = req.body.bearerToken;
        const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
        const queryData = {
            "commands":`INSERT
            INTO  "SNT24490"."USERS" ("NAME","EMAIL","SERIAL","AREA","MNGRNAME","MNGREMAIL","PASSWORD","USERTYPE")
            VALUES('${employeeName}', '${employeeEmail}', '${employeeSerial}', '${employeeArea}', '${mngrName}', '${mngrEmail}', '${pwd}', ${usertypeid});`, //actualizar esta query
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
                if(response.data.results[0].error){
                    res.status(404).json({"message":response.data.results[0].error})
                }else {
                    res.status(201).json({"message":"user created succesfully"})
                }
                console.log(response.data.results[0].error)
                console.log(bcrypt.hashSync("prueba123",8));
            })
        })            
    })
}

module.exports.changePasswordAdmin = (req,res) => {
    const {employeeEmail} = req.body;
    if(employeeEmail.length<1 || employeeEmail.length<254 || req.body.newPwd.length<1){
        return res.status(400).json({message:"Please provide the neccesary data"})
    }
    var newPwd = bcrypt.hashSync(req.body.pwd,8);
    const token = req.body.bearerToken;
    const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
    const queryData = {
        "commands":`UPDATE "SNT24490"."USERS" SET "PASSWORD" = '${newPwd}' WHERE "EMAIL" = '${employeeEmail}';`,//modificar "query data" con el query SQL
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
                        console.log(response.data.results[0])
                        res.json({message:"success"})//respuesta con success(json)
                    }
                } catch(error){
                    console.error(error);//errorHandling
                    return res.status(404).json({message:error})
                }
            })
    })            

}

module.exports.changePassword = (req,res) => {
    const {employeeEmail} = req.body;
    if(employeeEmail.length<1 || employeeEmail.length<254 || req.body.newPwd.length<1){
        return res.status(400).json({message:"Please provide the neccesary data"})
    }
    var newPwd = bcrypt.hashSync(req.body.newPwd,8);
    const token = req.body.bearerToken;
    const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
    const queryData = {
        "commands":`UPDATE "SNT24490"."USERS" SET "PASSWORD" = '${newPwd}' WHERE "EMAIL" = '${employeeEmail}';`,//modificar "query data" con el query SQL
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
                        console.log(response.data.results[0])
                        res.json({message:"success"})//respuesta con success(json)
                    }
                } catch(error){
                    console.error(error);//errorHandling
                    return res.status(404).json({message:error})
                }
            })
    })
}

module.exports.changeUserType = (req,res) => {
    const {employeeEmail,userType} = req.body;
    if(employeeEmail.length<1 || employeeEmail.length<254 || userType.length<1){
        return res.status(400).json({message:"Please provide the neccesary data"})
    }
    const token = req.body.bearerToken;
    const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
    const queryData = {
        "commands":`UPDATE "SNT24490"."USERS" SET "USERTYPE" = '${userType}' WHERE "EMAIL"='${employeeEmail}';`,//modificar "query data" con el query SQL
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
                        console.log(response.data.results[0])
                        res.json({message:"success"})//respuesta con success(json)
                    }
                } catch(error){
                    console.error(error);//errorHandling
                    return res.status(404).json({message:error})
                }
            })
    })
}

module.exports.deleteUser = (req,res) => {
    const {employeeEmail,mngrEmail,mngrName} = req.body;
    if(employeeEmail.length<1 || employeeEmail.length<254){
        return res.status(400).json({message:"Please provide the neccesary data"})
    }
    const token = req.body.bearerToken;
    const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
    const queryData = {
        "commands":`DELETE FROM "SNT24490"."USERS" WHERE "EMAIL" = '${employeeEmail}';
        UPDATE "SNT24490"."PERIPHERAL" SET "MNGRNAME" = '${mngrName}',"MNGREMAIL" = '${mngrEmail}' WHERE "MNGREMAIL" = '${employeeEmail}';`,//modificar "query data" con el query SQL
        "limit":100000,
        "separator":";",
        "multipleStatements":true,
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
                        res.json({message:"success"})//respuesta con success(json)
                    }
                } catch(error){
                    console.error(error);//errorHandling
                    return res.status(404).json({message:error})
                }
            })
    }) 
}

module.exports.getUsers = (req,res) =>{
    const token = req.body.bearerToken;
    const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
    const queryData = {
        "commands":`SELECT "NAME", "EMAIL", "SERIAL", "AREA", "MNGRNAME", "MNGREMAIL", "USERTYPE" FROM "SNT24490"."USERS";`,
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
                    let users = [{}]
                        for(let i = 0; i < response.data.results[0].rows_count; i++){
                            var newRow = {
                                employeeName: response.data.results[0].rows[i][0],
                                employeeEmail: response.data.results[0].rows[i][1],
                                serial: response.data.results[0].rows[i][2],
                                area: response.data.results[0].rows[i][3],
                                mngrName: response.data.results[0].rows[i][4],
                                mngrEmail: response.data.results[0].rows[i][5],
                                userType: response.data.results[0].rows[i][6],
                                }
                            users[i] = newRow
                        }
                        
                        res.json(users)
                } catch(error){
                    console.error(error);//errorHandling
                    return res.status(404).json({message:error})
                }
            })
    })            
}

module.exports.getUser = (req,res) =>{
    const email = req.params;
    const token = req.body.bearerToken;
    const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
    const queryData = {
        "commands":`SELECT "NAME", "EMAIL", "SERIAL", "AREA", "MNGRNAME", "MNGREMAIL", "USERTYPE" FROM "SNT24490"."USERS" WHERE "EMAIL"=${email};`,
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
                var user = {
                    employeeName: response.data.results[0].rows[0][0],
                    employeeEmail: response.data.results[0].rows[0][1],
                    serial: response.data.results[0].rows[0][2],
                    area: response.data.results[0].rows[0][3],
                    mngrName: response.data.results[0].rows[0][4],
                    mngrEmail: response.data.results[0].rows[0][5],
                    userType: response.data.results[0].rows[0][6],
                }
                res.json(user)
                } catch(error){
                    console.error(error);//errorHandling
                    return res.status(404).json({message:error})
                }
            })
    })            
}