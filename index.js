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
const peripheralRoutes = require('./routes/peripheral');
const recordRoutes = require('./routes/record')

app.use('/auth',authRoutes);
app.use('/peripheral',peripheralRoutes);
app.use('/record',recordRoutes)

//settings
app.set('json spaces',4);

app.listen(process.env.PORT || 3001, ()=>{
    console.log('server on port ', process.env.PORT || 3001)
})
