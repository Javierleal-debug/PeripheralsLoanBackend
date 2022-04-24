
const axios = require( 'axios' );
const credentials = require( './credentials.json' );


/*Get token,
Make query
get Query results
*/



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
        "commands":"SELECT * FROM USERSDATABASE where email='luis-armandosl@hotmail.com'",
        "limit":10,
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
            .then(response => console.log(response.data.results[0].rows))
    })
        
        
});