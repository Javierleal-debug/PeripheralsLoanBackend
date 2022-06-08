const axios = require('axios');
const credentials = require('../config/credentials.json');
const jwt = require('jsonwebtoken')
const config = require('../config/auth.config');
const nodemailer = require('nodemailer');
const mailConfig = require('../config/mail.config')
const QRCode = require('qrcode');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: mailConfig.user, // generated ethereal user
      pass: mailConfig.pass, // generated ethereal password
    },
});

transporter.verify().then(() => {
    console.log("Ready to send emails")
});

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
    var userToken = req.headers['x-access-token'];
    jwt.verify(userToken,config.secret,(err,decoded) => {
        
        const token = req.body.bearerToken;
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
                    
                        let devices = [{}]
                        for(let i = 0; i < response.data.results[0].rows_count; i++){
                            var newRow = {
                                type: response.data.results[0].rows[i][0],
                                brand: response.data.results[0].rows[i][1],
                                model: response.data.results[0].rows[i][2],
                                serialNumber: response.data.results[0].rows[i][3],
                                acceptedConditions: response.data.results[0].rows[i][4],
                                isInside: response.data.results[0].rows[i][5],
                                securityAuthorization: response.data.results[0].rows[i][6],
                                employeeName: response.data.results[0].rows[i][7]
                                }
                            devices[i] = newRow
                        }
                        
                        res.json(devices)
                    } catch(error){
                        console.error(error);
                        res.json({"message":"error"})
                    }
                })
        })            
    })
}

module.exports.peripheral = (req,res)=>{
    const {serialNumber} = req.params;
    
    if(serialNumber.length > 100){
        res.json({message:"Invalid peripheral serialNumber length(max 100)"})
    }
    const onlyAllowedPattern = /^[A-Za-z0-9]+$/;
    if(!serialNumber.match(onlyAllowedPattern)){
        return res.status(400).json({ err: "No special characters, please!"})
    }
    const token = req.body.bearerToken;
    const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
    const queryData = {
        "commands":`SELECT * from "SNT24490"."PERIPHERAL" WHERE serialNumber='${serialNumber}' AND "HIDDEN"=false; `,
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
}

module.exports.addPeripheral = (req,res,next) => {
    req.body.action="ADD PERIPHERAL";
    var {type,brand,model,serialNumber,comment}=req.body;
    if(brand.length<1 || model.length<1 || serialNumber<1){ //type is not proofchecked because of a middleware feature that already does the same
        return res.json({message:'Please provide the necessary data'});
    }
    var date = getDate();
    const userToken = req.headers["x-access-token"];
    console.log(date);
    jwt.verify(userToken, config.secret, (err, decoded) => {
        var EmployeeArea = decoded.area;
        var MngrName = decoded.name;
        var MngrEmail = decoded.id;
        console.log(decoded)
        const token = req.body.bearerToken;
        const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
        const queryData = {
            "commands":`insert INTO  "SNT24490"."PERIPHERAL" ("TYPE","BRAND","MODEL","SERIALNUMBER","ACCEPTEDCONDITIONS","ISINSIDE","SECURITYAUTHORIZATION","EMPLOYEEAREA","MNGRNAME","MNGREMAIL","DATE","COMMENT")
             values('${type}','${brand}','${model}','${serialNumber}',${false},${true},${false},'${EmployeeArea}','${MngrName}','${MngrEmail}','${date}','${comment}');`,
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
                            return res.json({message:response.data.results[0].error})
                        }else{
                            console.log(response.data.results[0])
                            res.json({message:"success"})//respuesta con success(json)
                            next();
                        }
                    } catch(error){
                        console.error(error);//errorHandling
                        return res.status(404).json({message:error})
                    }
                })
        })
    })
}

module.exports.deletePeripheral = (req,res,next) => {
    req.body.action="DELETE PERIPHERAL";
    const {serialNumber} = req.params;
    const {comment} = req.body;
    if(serialNumber.length > 100 || serialNumber.length<1){
        res.json({message:"Invalid peripheral serialNumber length(max 100)"})
    }
    const onlyAllowedPattern = /^[A-Za-z0-9]+$/;
    if(!serialNumber.match(onlyAllowedPattern)){
        return res.status(400).json({ err: "No special characters, please!"})
    }
    const token = req.body.bearerToken;
    const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
    const queryData = {
        "commands":`UPDATE "SNT24490"."PERIPHERAL" SET "HIDDEN" = true, "COMMENT"='${comment}' WHERE "SERIALNUMBER" ='${serialNumber}' ;`,
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
                        next();
                    }else{
                        console.log(response.data/*.results[0]*/)
                        return res.json({message:response.data.results[0].warning})//respuesta con success(json)
                    }
                    
                } catch(error){
                    console.error(error);//errorHandling
                    return res.status(404).json({message:"User not found"})
                }
            })
    })
}

module.exports.deletePeripherals = (req,res,next) => {
    req.body.action="DELETE PERIPHERALS";
    const {comment} = req.body;
    const serialNumber = [];
    req.body.array.forEach((i)=>{
        serialNumber.push("'" + i + "'");
    });
    const token = req.body.bearerToken;
    const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
    const queryData = {
        "commands":`UPDATE "SNT24490"."PERIPHERAL" SET "HIDDEN" = true, "COMMENT"='${comment}' WHERE "SERIALNUMBER" in (${serialNumber});`,//modificar "query data" con el query SQL
        "limit":1000000,
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
                        next();
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
}

module.exports.peripheralsInAndOutByDate = (req,res) => {
    const {date} = req.body; //formato YYYY-MM-DD
    
    if (date.length > 10 || date.length<1) {
        return res.json({message:"Invalid date length(should be 10)"});
    }
    const onlyAllowedPattern = /^[0-9 -]+$/;
    if(!date.match(onlyAllowedPattern)){
        return res.status(400).json({ err: "No special characters, please!"})
    }
    const token = req.body.bearerToken;
    const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
    const queryData = {
        "commands":`SELECT COUNT "DATE"  FROM "SNT24490"."PERIPHERAL" WHERE "DATE" BETWEEN '2022-01-01' AND '${date} 23:59:59' and "ISINSIDE"=true and "HIDDEN"=false; SELECT COUNT "DATE"  FROM "SNT24490"."PERIPHERAL" WHERE "DATE" BETWEEN '2022-01-01' AND '${date} 23:59:59' and "ISINSIDE"=false and "HIDDEN"=false;`,//modificar "query data" con el query SQL
        "limit":1000000,
        "separator":";",
        "stop_on_error":"no"
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
                        console.log(date);
                        console.log(response.data.results[0])
                        res.json({"message":response.data.results[0].error})
                    }else{
                        console.log(response.data.results)
                        res.json({"valueIn":response.data.results[0].rows[0][0],"valueOut":response.data.results[1].rows[0][0]})//respuesta con success(json)
                    }
                } catch(error){
                    console.error(error);
                    res.json({"results":"error"})
                }
            })
    })
}

module.exports.peripheralRequest = async (req,res) => {
    var userToken = req.headers['x-access-token'];
    var {serialNumber,employeeName,employeeEmail,employeeSerial} = req.body;
    if(serialNumber.length<1 || employeeName.length<1 || employeeEmail.length<1 || employeeSerial.length<1){
        return res.json({message:'Please provide the necessary data'});
    }
    jwt.verify(userToken,config.secret, (err,decoded) => {
        const employeeArea = decoded.area;
        const mngrName = decoded.mngrName;
        const mngrEmail = decoded.mngrEmail;
        date = getDate();
        QRCode.toDataURL(`https://peripheral-loans-equipo7.mybluemix.net/#/devices/${serialNumber}`,(err,url) => {
            const token = req.body.bearerToken;
            const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
            const queryData = {
                "commands":`UPDATE "SNT24490"."PERIPHERAL" SET "EMPLOYEENAME" = '${employeeName}',"EMPLOYEEEMAIL" = '${employeeEmail}',"EMPLOYEESERIAL" = '${employeeSerial}',"EMPLOYEEAREA" = '${employeeArea}',"MNGRNAME" = '${mngrName}',"MNGREMAIL" = '${mngrEmail}', "DATE" = '${date}'
                WHERE "SERIALNUMBER" = '${serialNumber}' and "HIDDEN"=false;SELECT "TYPE","BRAND","MODEL","SERIALNUMBER" FROM "SNT24490"."PERIPHERAL" WHERE "SERIALNUMBER" = '${serialNumber}' and "HIDDEN"=false;`,//modificar "query data" con el query SQL
                "limit":10000000,
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
                            console.log(response.data.results[1].rows[0]);
                            if(response.data.results[0].error){
                                console.log(response.data.results[0])
                                return res.json({message:response.data.results[0].error})
                            }else{
                                console.log(response.data.results[0])
                                
                                // send mail with defined transport object
                                console.log('aqui')
                                var serialNumberUrl = jwt.sign({serialNumber:serialNumber,email:employeeEmail},mailConfig.secret, {expiresIn: 172800})
                                var mailOptions = {
                                    from: '"Peripheral User Agreement " <ibmperipheralloansequipo7@gmail.com>', // sender address
                                    to: employeeEmail, // list of receivers
                                    subject: "Peripheral User Agreement", // Subject line
                                    html: `
                                    <h1>Acuerdo de Usuario</h1>
                                    <p>
                                        1.- Acepto ser responsable del cuidado del dispositivo; que me esta siendo
                                        asignado como instrumento de trabajo, por lo que certifico que cuento con
                                        los conocimientos y la capacidad necesaria para darle uso adecuado.
                                    </p>
                                    <p>
                                        2.- En caso que el dispositivo se dañe por negligencia o mal uso del mismo
                                        al ser este una herramienta de trabajo se revisara el caso para determinar
                                        si hubo algún mal uso o descuido de las mismas, en el entendido de que
                                        podría ser responsable de cubrir el costo de reparación o reposición
                                    </p>
                                    <p>
                                        3.-El Dispositivo me está siendo asignado como instrumento de trabajo para
                                        el desempeño de las actividades propias de mi puesto, por lo que seguiré
                                        esta normativa referente al uso y cuidado de estos instrumentos
                                        proporcionados por IBM y deberán de ser devueltos contra el requerimiento
                                        de IBM con el desgaste de uso natural.
                                    </p>
                                    <p>
                                        4.- En caso de extravió, o robo del Dispositivo por no cumplir con las
                                        reglas de seguridad establecidas por la compañía o no entregarla en la
                                        fecha establecida de devolución, seré responsable de reponer el monto que
                                        se me señale.
                                    </p>
                                    <p>Peripheral: </p>
                                    <p>Tipo: ${response.data.results[1].rows[0][0]}</p>
                                    <p>Marca: ${response.data.results[1].rows[0][1]}</p>
                                    <p>Modelo: ${response.data.results[1].rows[0][2]}</p>
                                    <p>Numero Serial ${response.data.results[1].rows[0][3]}</p>
                                    <a href="https://peripheral-loans-equipo7.mybluemix.net/#/confirmation/${serialNumberUrl}">Si aceptas este acuerdo haz click aqui para confirmar y seguir con el proceso de "Peripheral Loan"(Este link expira en 48hrs)</a>
                                    <p>Despues de aceptar el acuerdo dirigete con un guardia para que escanee el QR: </p><img src="${url}">
                                    `
                                };
                                try{
                                    transporter.sendMail(mailOptions, function(error,info){
                                        if (error) {
                                            console.log(error);
                                        } else {
                                            console.log('Email sent: ' + info.response);
                                            res.json({message:"success"})//respuesta con success(json)
                                        }
                                    });
                                }catch(error){
                                    console.log(error)
                                }
                            }
                        } catch(error){
                            console.error(error);//errorHandling
                            return res.status(404).json({message:error})
                        }
                    })
            })
        })
        
    });
 }

module.exports.peripheralLoan = (req,res,next) => {
    req.body.action="LOAN PERIPHERAL";
    const {serialNumber} = req.body;
    if(serialNumber.length<1){
        return res.json({message:'Please provide the necessary data'});
    }
    var date = getDate();
    const token = req.body.bearerToken;
    const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
    const queryData = {
        "commands":`UPDATE "SNT24490"."PERIPHERAL" SET "ACCEPTEDCONDITIONS" = true,"DATE" = '${date}'
        WHERE "SERIALNUMBER" = '${serialNumber}' and "HIDDEN"=false;`,//modificar "query data" con el query SQL
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
                        next();
                    }
                } catch(error){
                    console.error(error);//errorHandling
                    return res.status(404).json({message:error})
                }
            })
    })
}

module.exports.peripheralReset = (req,res,next) => {
    req.body.action="RESET PERIPHERAL"
    var userToken = req.headers['x-access-token'];
    var {serialNumber} = req.body;
    if(serialNumber.length<1){
        return res.json({message:'Please provide the necessary data'});
    }
    var date = getDate();
    jwt.verify(userToken,config.secret, (err,decoded) => {
        var mngrName = decoded.name;
        var mngrEmail = decoded.id;
        const token = req.body.bearerToken;
        const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
        const queryData = {
            "commands":`UPDATE "SNT24490"."PERIPHERAL" SET "ACCEPTEDCONDITIONS" = false,"ISINSIDE"=true,"SECURITYAUTHORIZATION"=false,"EMPLOYEENAME" = '',"EMPLOYEEEMAIL" = '',"EMPLOYEESERIAL" = '',"EMPLOYEEAREA" = '',"MNGRNAME" = '${mngrName}',"MNGREMAIL" = '${mngrEmail}', "DATE" = '${date}'
WHERE "SERIALNUMBER" = '${serialNumber}' and "HIDDEN"=false;`,//modificar "query data" con el query SQL
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
                            next();
                        }
                    } catch(error){
                        console.error(error);//errorHandling
                        return res.status(404).json({message:error})
                    }
                })
        })
    })
}

module.exports.peripheralReturn = (req,res,next) => {
    req.body.action="RETURN PERIPHERAL";
    var userToken = req.headers['x-access-token'];
    var {serialNumber} = req.body;
    if(serialNumber.length<1){
        return res.json({message:'Please provide the necessary data'});
    }
    var date = getDate();
    jwt.verify(userToken,config.secret, (err,decoded) => {
        const mngrName = decoded.mngrName;
        const mngrEmail = decoded.mngrEmail;
        const token = req.body.bearerToken;
            const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
            const queryData = {
                "commands":`UPDATE "SNT24490"."PERIPHERAL" SET "ACCEPTEDCONDITIONS" = false,"ISINSIDE"=true,"SECURITYAUTHORIZATION"=false,"EMPLOYEENAME" = '',"EMPLOYEEEMAIL" = '',"EMPLOYEESERIAL" = '',"EMPLOYEEAREA" = '',"MNGRNAME" = '${mngrName}',"MNGREMAIL" = '${mngrEmail}', "DATE" = '${date}'
    WHERE "SERIALNUMBER" = '${serialNumber}' and "HIDDEN"=false;`,//modificar "query data" con el query SQL
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
                                next();
                            }
                        } catch(error){
                            console.error(error);//errorHandling
                            return res.status(404).json({message:error})
                        }
                    })
            })
    })
}

module.exports.peripheralSecurityAuthorize = (req,res,next) => {
    req.body.action="SECURITY AUTHORIZE PERIPHERAL"
    const {serialNumber} = req.body;
    if(serialNumber.length<1){
        return res.json({message:'Please provide the necessary data'});
    }
    date = getDate();
    const token = req.body.bearerToken;
    const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
    const queryData = {
        "commands":`UPDATE "SNT24490"."PERIPHERAL" SET "SECURITYAUTHORIZATION" = true,"ISINSIDE"=false, "DATE" = '${date}'
        WHERE "SERIALNUMBER" = '${serialNumber}' and "HIDDEN"=false;`,//modificar "query data" con el query SQL
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
                        next();
                    }
                } catch(error){
                    console.error(error);//errorHandling
                    return res.status(404).json({message:error})
                }
            })
    })  
}

module.exports.peripheralsByEmail = (req,res) => {
    const userToken = req.headers['x-access-token'];
    jwt.verify(userToken,config.secret,(err,decoded) => {
        const email = decoded.id
        const token = req.body.bearerToken;
        const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
        const queryData = {
            "commands":`SELECT * FROM "SNT24490"."PERIPHERAL" where "HIDDEN"=false and "EMPLOYEEEMAIL"='${email}';`,
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
                        //console.log(response.data.results[0])
                        if(response.data.results[0].rows_count === 0){
                            res.json("")
                        }else{
                            let devices = []
                            for(let i = 0; i < response.data.results[0].rows_count; i++){
                                var newRow = {
                                    type: response.data.results[0].rows[i][0],
                                    brand: response.data.results[0].rows[i][1],
                                    model: response.data.results[0].rows[i][2],
                                    serialNumber: response.data.results[0].rows[i][3],
                                    acceptedConditions: response.data.results[0].rows[i][4],
                                    isInside: response.data.results[0].rows[i][5],
                                    securityAuthorization: response.data.results[0].rows[i][6],
                                    employeeName: response.data.results[0].rows[i][7],
                                    date: response.data.results[0].rows[i][13]
                                    }
                                devices[i] = newRow
                            }
                            res.json(devices)
                        }
                    } catch(error){
                        console.error(error);
                        res.json({"message":"error"})
                    }
                })
        })
    })
}

module.exports.peripheralsInAndOutByDateData = (req,res) => {
    const {date} = req.body; //formato YYYY-MM-DD
    
    if (date.length !== 10 ) {
        return res.json({message:"Invalid date length(should be 10)"});
    }
    const onlyAllowedPattern = /^[0-9 -]+$/;
    if(!date.match(onlyAllowedPattern)){
        return res.status(400).json({ err: "No special characters, please!"})
    }
    const token = req.body.bearerToken;
    const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
    const queryData = {
        "commands":`SELECT * FROM "SNT24490"."PERIPHERAL" WHERE "DATE" BETWEEN '2022-01-01' AND '${date} 23:59:59';`,//modificar "query data" con el query SQL
        "limit":10000,
        "separator":";",
        "stop_on_error":"no"
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
                    console.log(response.data.results[0].rows)
                    let devices = [{type: "Type",
                        brand: "Brand",
                        model: "Model",
                        serialNumber: "Serial Number",
                        acceptedConditions: "Accepted Conditions",
                        isInside: "Is Inside",
                        securityAuthorization: "Security Authorization",
                        employeeName: "Employee Name",
                        employeeEmail: "Employee Email",
                        employeeSerial: "Employee Serial",
                        area: "Area",
                        mngrName: "Manager Name",
                        mngrEmail: "Manager Email",
                        date: "Date",
                        comment: "Comment",
                        hidden: "Hidden"}]
                    if(response.data.results[0].rows_count === 0){
                        res.json("")
                    }else{
                        for(let i = 0; i < response.data.results[0].rows_count; i++){
                            console.log(i)
                            var newRow = {
                                type: response.data.results[0].rows[i][0],
                                brand: response.data.results[0].rows[i][1],
                                model: response.data.results[0].rows[i][2],
                                serialNumber: response.data.results[0].rows[i][3],
                                acceptedConditions: response.data.results[0].rows[i][4],
                                isInside: response.data.results[0].rows[i][5],
                                securityAuthorization: response.data.results[0].rows[i][6],
                                employeeName: response.data.results[0].rows[i][7],
                                employeeEmail: response.data.results[0].rows[i][8],
                                employeeSerial: response.data.results[0].rows[i][9],
                                area: response.data.results[0].rows[i][10],
                                mngrName: response.data.results[0].rows[i][11],
                                mngrEmail: response.data.results[0].rows[i][12],
                                date: response.data.results[0].rows[i][13],
                                comment: response.data.results[0].rows[i][14],
                                hidden: response.data.results[0].rows[i][15],
                                }
                            devices[i+1] = newRow
                        }
                    }
                    res.json(devices)
                } catch(error){
                    console.error(error);
                    return res.json({"message":"error"})
                }
            })
    })
}

module.exports.peripheralsByMngrEmail = (req,res) => {
    const userToken = req.headers['x-access-token'];
    jwt.verify(userToken,config.secret,(err,decoded) => {
        const mngrEmail = decoded.id
        //console.log(email)
        const token = req.body.bearerToken;
        const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
        const queryData = {
            "commands":`SELECT * FROM "SNT24490"."PERIPHERAL" where "HIDDEN"=false and "MNGREMAIL"='${mngrEmail}';`,
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
                        //console.log(response.data.results[0])
                        if(response.data.results[0].rows_count === 0){
                            res.json("")
                        }else{
                            let devices = []
                            for(let i = 0; i < response.data.results[0].rows_count; i++){
                                var newRow = {
                                    type: response.data.results[0].rows[i][0],
                                    brand: response.data.results[0].rows[i][1],
                                    model: response.data.results[0].rows[i][2],
                                    serialNumber: response.data.results[0].rows[i][3],
                                    acceptedConditions: response.data.results[0].rows[i][4],
                                    isInside: response.data.results[0].rows[i][5],
                                    securityAuthorization: response.data.results[0].rows[i][6],
                                    employeeName: response.data.results[0].rows[i][7],
                                    date: response.data.results[0].rows[i][13]
                                    }
                                devices[i] = newRow
                            }
                            res.json(devices)
                        }
                    } catch(error){
                        console.error(error);
                        res.json({"message":"error"})
                    }
                })
        })
    })   
}

module.exports.peripheralAcceptConditions = (req,res,next) => {
    const serialNumberUrl = req.params.serialNumberUrl;
    req.body.action = 'PERIPHERAL ACCEPT'
    jwt.verify(serialNumberUrl,mailConfig.secret, (err,decoded) => {
        if(err){
            return res.status(404).json({message:"something is wrong"})
        }
        var date = getDate();
        const serialNumber = decoded.serialNumber;
        const email = decoded.email;
        const token = req.body.bearerToken;
        const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
        const queryData = {
            "commands":`UPDATE "SNT24490"."PERIPHERAL" SET "ACCEPTEDCONDITIONS" = true,"DATE" = '${date}'
            WHERE "SERIALNUMBER" = '${serialNumber}' and "HIDDEN"=false AND "EMPLOYEEEMAIL"='${email}';`,//modificar "query data" con el query SQL
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
                            req.body.serialNumber = serialNumber;
                            res.json({message:"success",serialNumber:serialNumber})
                            next();
                            
                        }
                    } catch(error){
                        console.error(error);//errorHandling
                        return res.status(404).json({message:error})
                    }
                })
        })
    })
}