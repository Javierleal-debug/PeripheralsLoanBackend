const jwt = require('jsonwebtoken');
const axios = require('axios');
const credentials = require('../config/credentials.json');
const config = require('../config/auth.config');
const bcrypt = require('bcryptjs');

const authUrl = 'https://iam.cloud.ibm.com/identity/token'; 
    const authData = `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${ credentials.ApiKey }`;
    const authConf = {
        Headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    };

module.exports.signin = (req,res)=>{
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
                const getDataUrl = `${queryURL}/${response.data.id}`
                axios.get(getDataUrl,queryConf)
                    .then(response => {
                        try{
                            var passwordIsValid = bcrypt.compareSync(
                                req.body.pwd,
                                response.data.results[0].rows[0][0]
                            );
                    
                            if (!passwordIsValid) {
                                return res.status(401).send({message: "Invalid Password"});
                            }
                            
                            var token = jwt.sign({id: email}, config.secret, {expiresIn: 86400})
                            
                            //console.log(token);

                            res.status(200).json({
                                email: email,
                                accessToken: token
                            })
                            
                        } catch(error){
                            console.error(error);
                            res.status(404).json({message:"User not found"})
                        }
                    })
            })            
        });
}

module.exports.signup = (req,res) => {
    const userid=req.body.userid;
    const email=req.body.email;
    const name=req.body.name;
    const last_name=req.body.last_name;
    const usertypeid=req.body.usertypeid;
    const pwd=bcrypt.hashSync(req.body.pwd,8);
    axios.post( authUrl, authData, authConf )
        .then( response => {
            // Making query
            const token = response.data.access_token
            const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
            const queryData = {
                "commands":`insert into usersdatabase values ('${userid}','${email}','${name}','${last_name}','${usertypeid}','${pwd}');`,
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
        });
}

module.exports.hasAccess = (req,res) => {
    res.json({"access":true});
}