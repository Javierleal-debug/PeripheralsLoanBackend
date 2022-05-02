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
    .post([hasToken,verifyToken],controller.addPeripheral)

router.route('/:serialNumber')
    .get([hasToken,verifyToken],controller.peripheral)
    .update([hasToken,verifyToken],controller.updatePeripheral)
    .delete([hasToken,verifyToken],controller.detelePeripheral)

module.exports=router; 