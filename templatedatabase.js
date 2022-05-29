const credentials=require('./config/credentials')
const axios= require('axios');
const res = require('express/lib/response');

const authUrl = 'https://iam.cloud.ibm.com/identity/token'; 
    const authData = `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${ credentials.ApiKey }`;
    const authConf = {
        Headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    };

    axios.post( authUrl, authData, authConf )
    .then( response => {
        // Making query
        const token = response.data.access_token
        const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
        const queryData = {
            "commands":`query data;`,//modificar "query data" con el query SQL
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
    });