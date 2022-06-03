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

module.exports.getRecords = (req,res) => {
    axios.post( authUrl, authData, authConf )
    .then( response => {
        // Making query
        const token = response.data.access_token
        const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
        const queryData = {
            "commands":`SELECT "RECORDID", "TYPE", "BRAND", "MODEL", "SERIALNUMBER", "ACCEPTEDCONDITIONS", "ISINSIDE", "SECURITYAUTHORIZATION", "EMPLOYEENAME", "EMPLOYEEEMAIL", "EMPLOYEESERIAL", "AREA", "MNGRNAME", "MNGREMAIL", "DATE", "ACTIONTYPE", "COMMENT"
            FROM "SNT24490"."RECORD";`,//modificar "query data" con el query SQL
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
                        //console.log(response.data.results[0].rows)
                        
                        let records = [{recordId: "RecordId",
                            type: "Type",
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
                            actionType: "ActionType",
                            comment: "Comment"}]
                        for(let i = 0; i < response.data.results[0].rows_count; i++){
                            var newRow = {
                                recordId: response.data.results[0].rows[i][0],
                                type: response.data.results[0].rows[i][1],
                                brand: response.data.results[0].rows[i][2],
                                model: response.data.results[0].rows[i][3],
                                serialNumber: response.data.results[0].rows[i][4],
                                acceptedConditions: response.data.results[0].rows[i][5],
                                isInside: response.data.results[0].rows[i][6],
                                securityAuthorization: response.data.results[0].rows[i][7],
                                employeeName: response.data.results[0].rows[i][8],
                                employeeEmail: response.data.results[0].rows[i][9],
                                employeeSerial: response.data.results[0].rows[i][10],
                                area: response.data.results[0].rows[i][11],
                                mngrName: response.data.results[0].rows[i][12],
                                mngrEmail: response.data.results[0].rows[i][13],
                                date: response.data.results[0].rows[i][14],
                                actionType: response.data.results[0].rows[i][15],
                                comment: response.data.results[0].rows[i][16],
                                }
                            records[i+1] = newRow
                        }
                        res.json(records)
                    } catch(error){
                        console.error(error);
                        return res.json({"message":"error"})
                    }
                })
        })            
    });
}

module.exports.getRecordsByDate = (req,res) => {
    const {date} = req.body; //formato YYYY-MM-DD
    
    if (date.length !== 10 ) {
        return res.json({message:"Invalid date length(should be 10)"});
    }
    const onlyAllowedPattern = /^[0-9 -]+$/;
    if(!date.match(onlyAllowedPattern)){
        return res.status(400).json({ err: "No special characters, please!"})
    }
    axios.post( authUrl, authData, authConf )
    .then( response => {
        // Making query
        const token = response.data.access_token
        const queryURL="https://bpe61bfd0365e9u4psdglite.db2.cloud.ibm.com/dbapi/v4/sql_jobs";
        const queryData = {
            "commands":`SELECT "RECORDID", "TYPE", "BRAND", "MODEL", "SERIALNUMBER", "ACCEPTEDCONDITIONS", "ISINSIDE", "SECURITYAUTHORIZATION", "EMPLOYEENAME", "EMPLOYEEEMAIL", "EMPLOYEESERIAL", "AREA", "MNGRNAME", "MNGREMAIL", "DATE", "ACTIONTYPE", "COMMENT"
            FROM "SNT24490"."RECORD" WHERE "DATE" BETWEEN '2022-01-01' AND '${date} 23:59:59';`,//modificar "query data" con el query SQL
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
                        //console.log(response.data.results[0].rows)
                        let records = [{recordId: "RecordId",
                            type: "Type",
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
                            actionType: "ActionType",
                            comment: "Comment"}]
                        for(let i = 0; i < response.data.results[0].rows_count; i++){
                            var newRow = {
                                recordId: response.data.results[0].rows[i][0],
                                type: response.data.results[0].rows[i][1],
                                brand: response.data.results[0].rows[i][2],
                                model: response.data.results[0].rows[i][3],
                                serialNumber: response.data.results[0].rows[i][4],
                                acceptedConditions: response.data.results[0].rows[i][5],
                                isInside: response.data.results[0].rows[i][6],
                                securityAuthorization: response.data.results[0].rows[i][7],
                                employeeName: response.data.results[0].rows[i][8],
                                employeeEmail: response.data.results[0].rows[i][9],
                                employeeSerial: response.data.results[0].rows[i][10],
                                area: response.data.results[0].rows[i][11],
                                mngrName: response.data.results[0].rows[i][12],
                                mngrEmail: response.data.results[0].rows[i][13],
                                date: response.data.results[0].rows[i][14],
                                actionType: response.data.results[0].rows[i][15],
                                comment: response.data.results[0].rows[i][16],
                                }
                            records[i+1] = newRow
                        }
                        res.json(records)
                    } catch(error){
                        console.error(error);
                        return res.json({"message":"error"})
                    }
                })
        })            
    });
}