const axios = require('axios');
const credentials = require('../config/credentials.json');
const jwt = require('jsonwebtoken')
const config = require('../config/auth.config');

const authUrl = 'https://iam.cloud.ibm.com/identity/token'; 
const authData = `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${ credentials.ApiKey }`;
const authConf = {
    Headers: {
        "Content-Type": "application/x-www-form-urlencoded"
    }
};

function getDate() {
    var date = new Date()
    var day = date.getDate()
    var month = date.getMonth() + 1
    var year = date.getFullYear()
    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()
    if(second < 10){
        second = '0'+ second;
    }
    if(minute < 10){
        minute = '0'+ minute;
    }
    return year + '-' + month + '-' + day + '-' + hour + '.' + minute + '.' + second +'.'
  }

module.exports.peripherals = (req,res) => {
    axios.post( authUrl, authData, authConf )
    .then( response => {
        // Making query
        const token = response.data.access_token
        const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
        const queryData = {
            "commands":`SELECT * FROM "SNT24490"."PERIPHERAL" where "HIDDEN"=false;`,
            "limit":10000,
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
            //console.log(response.data)
            const getDataUrl = `${queryURL}/${response.data.id}`
            axios.get(getDataUrl,queryConf)
                .then(response => {
                    try{
                        //console.log(response.data.results[0].rows)
                        res.json(response.data.results[0].rows)
                    } catch(error){
                        console.error(error);
                        res.json({"message":"error"})
                    }
                })
        })            
    });
}

module.exports.peripheral = (req,res)=>{
    axios.post( authUrl, authData, authConf )
    .then( response => {
        // Making query
        const token = response.data.access_token
        const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
        const queryData = {
            "commands":`SELECT * from "SNT24490"."PERIPHERAL" WHERE serialNumber='${req.params.serialNumber}' AND "HIDDEN"=false; `,
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
            //console.log(response.data)
            const getDataUrl = `${queryURL}/${response.data.id}`
            axios.get(getDataUrl,queryConf)
                .then(response => {
                    try{
                        console.log(response.data.results[0].rows[0])
                        res.json(response.data.results[0].rows[0])
                    } catch(error){
                        console.error(error);
                        res.json({"results":"error"})
                    }
                })
        })        
    });
}

module.exports.addPeripheral = (req,res) => {
    var {type,brand,model,serialNumber,acceptedConditions,isInside,securityAuthorization,employeeName,employeeEmail,employeeSerial,comment}=req.body;
    var date = getDate();
    const userToken = req.headers["x-access-token"];
    console.log(date);
    jwt.verify(userToken, config.secret, (err, decoded) => {
        var EmployeeArea = decoded.area;
        var MngrName = decoded.name;
        var MngrEmail = decoded.id;
        console.log(decoded)
        axios.post( authUrl, authData, authConf )
    .then( response => {
        // Making query
        const token = response.data.access_token
        const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
        const queryData = {
            "commands":`insert INTO  "SNT24490"."PERIPHERAL" ("TYPE","BRAND","MODEL","SERIALNUMBER","ACCEPTEDCONDITIONS","ISINSIDE","SECURITYAUTHORIZATION","EMPLOYEENAME","EMPLOYEEEMAIL","EMPLOYEESERIAL","EMPLOYEEAREA","MNGRNAME","MNGREMAIL","DATE","COMMENT")
             values('${type}','${brand}','${model}','${serialNumber}',${acceptedConditions},${isInside},${securityAuthorization},'${employeeName}','${employeeEmail}','${employeeSerial}','${EmployeeArea}','${MngrName}','${MngrEmail}','${date}','${comment}');`,
            "limit":10000,
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
                            res.json({message:response.data.results[0].error})
                        }else{
                            console.log(response.data.results[0])
                            res.json({message:"success"})//respuesta con success(json)
                        }
                    } catch(error){
                        console.error(error);//errorHandling
                        res.status(404).json({message:error})
                    }
                })
        })            
    });
    })

    
}

module.exports.updatePeripheral = (req,res) => {
    const {serialNumber} = req.params;
    const {type,brand,model} = req.body;
    axios.post( authUrl, authData, authConf )
    .then( response => {
        // Making query
        const token = response.data.access_token
        const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
        const queryData = {
            "commands":`update "SNT24490"."PERIPHERAL" set type='${type}', brand='${brand}', model='${model}' where serialNumber='${serialNumber}';`,
            "limit":10000,
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
                        //manejas informacion que pediste por el query
                        console.log(response.data.results[0])
                        res.json({message:"success"})//respuesta con success(json)
                    } catch(error){
                        console.error(error);//errorHandling
                        res.status(404).json({message:"User not found"})
                    }
                })
        })            
    });
}

module.exports.deletePeripheral = (req,res) => {
    const {serialNumber} = req.params;
    axios.post( authUrl, authData, authConf )
    .then( response => {
        // Making query
        const token = response.data.access_token
        const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
        const queryData = {
            "commands":`UPDATE "SNT24490"."PERIPHERAL" SET "HIDDEN" = true WHERE "SERIALNUMBER" ='${serialNumber}' ;`,
            "limit":10000,
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
                        //manejas informacion que pediste por el query
                        if(!response.data.results[0].warning){
                            console.log(response.data/*.results[0]*/)
                            res.json({message:"success"})//respuesta con success(json)
                        }else{
                            console.log(response.data/*.results[0]*/)
                            res.json({message:response.data.results[0].warning})//respuesta con success(json)
                        }
                        
                    } catch(error){
                        console.error(error);//errorHandling
                        res.status(404).json({message:"User not found"})
                    }
                })
        })            
    });
}

module.exports.deletePeripherals = (req,res) => {
    const serialNumber = [];
    req.body.array.forEach((i)=>{
        serialNumber.push("'" + i + "'");
    });
    axios.post( authUrl, authData, authConf)
    .then( response => {
        // Making query
        const token = response.data.access_token
        const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
        const queryData = {
            "commands":`UPDATE "SNT24490"."PERIPHERAL" SET "HIDDEN" = true WHERE "SERIALNUMBER" in (${serialNumber});`,//modificar "query data" con el query SQL
            "limit":10000,
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
                        //manejas informacion que pediste por el query
                        if(!response.data.results[0].warning){
                            console.log(response.data/*.results[0]*/)
                            res.json({message:"success"})//respuesta con success(json)
                        }else{
                            console.log(response.data/*.results[0]*/)
                            res.json({message:response.data.results[0].warning})//respuesta con success(json)
                        }
                        
                    } catch(error){
                        console.error(error);//errorHandling
                        res.status(404).json({message:"User not found"})
                    }
                })
        })            
    });
}

module.exports.peripheralsInsideByDate = (req,res) => {
    const {date} = req.body; //formato YYYY-MM-DD
    axios.post( authUrl, authData, authConf )
    .then( response => {
        // Making query
        const token = response.data.access_token
        const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
        const queryData = {
            "commands":`SELECT COUNT "DATE"  FROM "SNT24490"."PERIPHERAL" WHERE "DATE" LIKE '${date}%' and "ISINSIDE"=true and "HIDDEN"=false;`,//modificar "query data" con el query SQL
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
                        console.log(response.data.results[0].rows[0])
                        res.json({"value":response.data.results[0].rows[0][0]})
                    } catch(error){
                        console.error(error);
                        res.json({"results":"error"})
                    }
                })
        })            
    });
}

module.exports.peripheralsOutsideByDate = (req,res) => {
    const {date} = req.body; //formato YYYY-MM-DD
    axios.post( authUrl, authData, authConf )
    .then( response => {
        // Making query
        const token = response.data.access_token
        const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
        const queryData = {
            "commands":`SELECT COUNT "DATE"  FROM "SNT24490"."PERIPHERAL" WHERE "DATE" LIKE '${date}%' and "ISINSIDE"=false and "HIDDEN"=false;`,//modificar "query data" con el query SQL
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
                        console.log(response.data.results[0].rows[0])
                        res.json({"value":response.data.results[0].rows[0][0]})
                    } catch(error){
                        console.error(error);
                        res.json({"results":"error"})
                    }
                })
        })            
    });
    
}

module.exports.peripheralRequest = (req,res) => {
    var userToken = req.headers['x-access-token'];
    var {serialNumber} = req.body;
    jwt.verify(userToken,config.secret, (err,decoded) => {
        const employeeName = decoded.name;
        const employeeEmail = decoded.email;
        const employeeSerial = decoded.serial;
        const employeeArea = decoded.area;
        const mngrName = decoded.mngrName;
        const mngrEmail = decoded.mngrEmail;
        date = getDate();
        
    axios.post( authUrl, authData, authConf )
    .then( response => {
        // Making query
        const token = response.data.access_token
        const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
        const queryData = {
            "commands":`UPDATE "SNT24490"."PERIPHERAL" SET "EMPLOYEENAME" = '${employeeName}',"EMPLOYEEEMAIL" = '${employeeEmail}',"EMPLOYEESERIAL" = '${employeeSerial}',"EMPLOYEEAREA" = '${employeeArea}',"MNGRNAME" = '${mngrName}',"MNGREMAIL" = '${mngrEmail}', "DATE" = '${date}'
WHERE "SERIALNUMBER" = '${serialNumber}' and "HIDDEN"=false;`,//modificar "query data" con el query SQL
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
                            res.json({message:response.data.results[0].error})
                        }else{
                            console.log(response.data.results[0])
                            res.json({message:"success"})//respuesta con success(json)
                        }
                    } catch(error){
                        console.error(error);//errorHandling
                        res.status(404).json({message:error})
                    }
                })
        })            
    });
    })
}

module.exports.peripheralLoan = (req,res) => {
    const {serialNumber} = req.body;
    var date = getDate();
    axios.post( authUrl, authData, authConf )
    .then( response => {
        // Making query
        const token = response.data.access_token
        const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
        const queryData = {
            "commands":`UPDATE "SNT24490"."PERIPHERAL" SET "ACCEPTEDCONDITIONS" = true,"DATE" = '${date}'
            WHERE "SERIALNUMBER" = '${serialNumber}' and "HIDDEN"=false;`,//modificar "query data" con el query SQL
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
                            res.json({message:response.data.results[0].error})
                        }else{
                            console.log(response.data.results[0])
                            res.json({message:"success"})//respuesta con success(json)
                        }
                    } catch(error){
                        console.error(error);//errorHandling
                        res.status(404).json({message:error})
                    }
                })
        })            
    });
}

module.exports.peripheralReset = (req,res) => {
    var userToken = req.headers['x-access-token'];
    var {serialNumber} = req.body;
    var date = getDate();
    jwt.verify(userToken,config.secret, (err,decoded) => {
        var mngrName = decoded.name;
        var mngrEmail = decoded.id;
        axios.post( authUrl, authData, authConf )
    .then( response => {
        // Making query
        const token = response.data.access_token
        const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
        const queryData = {
            "commands":`UPDATE "SNT24490"."PERIPHERAL" SET "ACCEPTEDCONDITIONS" = false,"EMPLOYEENAME" = '',"EMPLOYEEEMAIL" = '',"EMPLOYEESERIAL" = '',"EMPLOYEEAREA" = '',"MNGRNAME" = '${mngrName}',"MNGREMAIL" = '${mngrEmail}', "DATE" = '${date}'
WHERE "SERIALNUMBER" = '${serialNumber}' and "HIDDEN"=false;`,//modificar "query data" con el query SQL
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
                            res.json({message:response.data.results[0].error})
                        }else{
                            console.log(response.data.results[0])
                            res.json({message:"success"})//respuesta con success(json)
                        }
                    } catch(error){
                        console.error(error);//errorHandling
                        res.status(404).json({message:error})
                    }
                })
        })            
    });
    })
    
}

module.exports.peripheralReturn = (req,res) => {
    var userToken = req.headers['x-access-token'];
    var {serialNumber} = req.body;
    var date = getDate();
    axios.post( authUrl, authData, authConf )
    .then( response => {
        // Making query
        const token = response.data.access_token
        const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
        const queryData = {
            "commands":`UPDATE "SNT24490"."PERIPHERAL" SET "ACCEPTEDCONDITIONS" = false,"EMPLOYEENAME" = '',"EMPLOYEEEMAIL" = '',"EMPLOYEESERIAL" = '',"EMPLOYEEAREA" = '',"MNGRNAME" = '${mngrName}',"MNGREMAIL" = '${mngrEmail}', "DATE" = '${date}'
WHERE "SERIALNUMBER" = '${serialNumber}' and "HIDDEN"=false;`,//modificar "query data" con el query SQL
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
                            res.json({message:response.data.results[0].error})
                        }else{
                            console.log(response.data.results[0])
                            res.json({message:"success"})//respuesta con success(json)
                        }
                    } catch(error){
                        console.error(error);//errorHandling
                        res.status(404).json({message:error})
                    }
                })
        })            
    });
}

module.exports.peripheralSecurityAuthorize = (req,res) => {
    const [serialNumber] = req.body;
    date = getDate();
    axios.post( authUrl, authData, authConf )
    .then( response => {
        // Making query
        const token = response.data.access_token
        const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
        const queryData = {
            "commands":`UPDATE "SNT24490"."PERIPHERAL" SET "SECURITYAUTHORIZATION" = true, "DATE" = '${date}'
WHERE "SERIALNUMBER" = '${serialNumber}' and "HIDDEN"=false;`,//modificar "query data" con el query SQL
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
                            res.json({message:response.data.results[0].error})
                        }else{
                            console.log(response.data.results[0])
                            res.json({message:"success"})//respuesta con success(json)
                        }
                    } catch(error){
                        console.error(error);//errorHandling
                        res.status(404).json({message:error})
                    }
                })
        })            
    });
}