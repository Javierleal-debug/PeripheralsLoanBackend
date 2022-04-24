const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
app = express();

var corsOptions = {
    origin: "*"
}

//middlewares
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


//routes
const authRoutes = require('./routes/auth');

app.use('/auth',authRoutes);

//settings
app.set('json spaces',4);

app.listen(3001, ()=>{
    console.log('server on port ',3001)
})
