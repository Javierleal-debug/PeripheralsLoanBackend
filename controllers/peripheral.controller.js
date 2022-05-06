const axios = require('axios');
const credentials = require('../config/credentials.json');

const authUrl = 'https://iam.cloud.ibm.com/identity/token'; 
const authData = `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${ credentials.ApiKey }`;
const authConf = {
    Headers: {
        "Content-Type": "application/x-www-form-urlencoded"
    }
};

module.exports.peripherals = (req,res) => {
    axios.post( authUrl, authData, authConf )
    .then( response => {
        // Making query
        const token = response.data.access_token
        const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
        const queryData = {
            "commands":`SELECT * from device;`,
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
            "commands":`SELECT * from device WHERE serialNumber='${req.params.serialNumber}'; `,
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
    var {type,brand,model,serialNumber,acceptedConditions,isInside,securityAuthorization}=req.body;
    axios.post( authUrl, authData, authConf )
    .then( response => {
        // Making query
        const token = response.data.access_token
        const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
        const queryData = {
            "commands":`insert into device values('${type}','${brand}','${model}','${serialNumber}',${acceptedConditions},${isInside},${securityAuthorization});`,
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
                        //console.log(response.data.results[0].rows)
                        res.json({message:"success"})//respuesta con success(json)
                    } catch(error){
                        console.error(error);//errorHandling
                        res.status(404).json({message:error})
                    }
                })
        })            
    });
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
            "commands":`update device set type='${type}', brand='${brand}', model='${model}' where serialNumber='${serialNumber}';`,
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
            "commands":`delete from device where serialNumber='${serialNumber}';`,
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
                        console.log(response.data.results[0].rows)
                        res.json({message:"success"})//respuesta con success(json)
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
            "commands":`delete from device where serialNumber in (${serialNumber});`,//modificar "query data" con el query SQL
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
                        console.log(response.data/*.results[0]*/)
                        res.json({message:"success"})//respuesta con success(json)
                    } catch(error){
                        console.error(error);//errorHandling
                        res.status(404).json({message:"User not found"})
                    }
                })
        })            
    });
}