const express = require('express');
const router = express.Router();
const axios = require('axios');
const credentials = require('../config/credentials.json');
const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');
const controller = require('../controllers/peripheral.controller');
const { hasToken,verifyToken } = require('../middleware/authJwt');



router.route('/')
    .get([hasToken,verifyToken],controller.peripherals)
    .post((req,res)=>{
        res.json({"device":"info"});
    })

module.exports=router; 