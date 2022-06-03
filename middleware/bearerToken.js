const axios = require('axios');
const credentials = require('../config/credentials.json');

const authUrl = 'https://iam.cloud.ibm.com/identity/token'; 
const authData = `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${ credentials.ApiKey }`;
const authConf = {
    Headers: {
        "Content-Type": "application/x-www-form-urlencoded"
    }
};

const getBearerToken = (req,res,next) => {
    axios.post( authUrl, authData, authConf )
    .then( response => {
        req.body.bearerToken = response.data.access_token
        next();
    })
    .catch((error)=>{
        return res.status(401).send({message: "Bearer token not working, try again in a minute"});
    })
}

const bearerToken = {
    getBearerToken:getBearerToken
}

module.exports = bearerToken;