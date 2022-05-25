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
    const {email,pwd} = req.body;
    try{
        if(email.length<0 || pwd.length<0){
            return res.json({message:"email and/or password not provided"})
        }
    }catch(e){
        return res.json({message:"email and/or password not provided"})
    }
    
    
    
    axios.post( authUrl, authData, authConf )
        .then( response => {
            // Making query
            const token = response.data.access_token
            const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
            const queryData = {
                "commands":`SELECT * FROM USERS where email='${email}';`,//cambiar de tabla a users
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
                            var userData=response.data.results[0].rows[0];
                            var passwordIsValid = bcrypt.compareSync(
                                pwd,
                                response.data.results[0].rows[0][6]
                            );
                    
                            if (!passwordIsValid) {
                                return res.status(401).send({message: "Invalid Password"});
                            }
                            
                            var token = jwt.sign({name:userData[0],id: email,serial:userData[2],area:userData[3],mngrName:userData[4],mngrEmail:userData[5],userType:userData[7]}, config.secret, {expiresIn: 86400})//añadir tipo de usuario en el token
                            
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
        var adminEmail = decoded.id;
        axios.post( authUrl, authData, authConf )
        .then( response => {
            // Making query
            const token = response.data.access_token
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
        });
    })
}

module.exports.hasAccess = (req,res) => {
    res.json({"access":true});
}