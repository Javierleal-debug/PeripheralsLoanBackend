const express = require('express');
const router = express.Router();
const axios = require('axios');
const credentials = require('../credentials.json');

const authUrl = 'https://iam.cloud.ibm.com/identity/token'; 
    const authData = `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${ credentials.ApiKey }`;
    const authConf = {
        Headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    };

router.route('/login')
    .post((req, res)=>{
        const email=req.body.email;
        const pwd=req.body.pwd;
               
        axios.post( authUrl, authData, authConf )
            .then( response => {
                // Making query
                const token = response.data.access_token
                const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
                const queryData = {
                    "commands":`SELECT password FROM USERSDATABASE where email='${email}';`,
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
                    console.log(response.data)
                    const getDataUrl = `${queryURL}/${response.data.id}`
                    axios.get(getDataUrl,queryConf)
                        .then(response => {
                            try{
                                console.log(response.data.results[0].rows[0][0])
                                if(pwd===response.data.results[0].rows[0][0]){
                                    res.json({"results":"login succesful"})
                                }else{
                                    res.json({"results":"login declined"})
                                }
                            } catch(error){
                                console.error(error);
                                res.json({"results":"error"})
                            }
                        })
                })            
            });
    })

    module.exports= router;