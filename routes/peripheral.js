const express = require('express');
const router = express.Router();
const axios = require('axios');
const credentials = require('../config/credentials.json');
const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');
const controller = require('../controllers/peripheral.controller');
const { hasToken,verifyToken, isFocal } = require('../middleware/authJwt');



router.route('/')
    .get([hasToken,verifyToken],controller.peripherals)
    .post([hasToken,verifyToken,isFocal],controller.addPeripheral)
    .delete([hasToken,verifyToken,isFocal],controller.deletePeripherals)

router.route('/:serialNumber')
    .get([hasToken,verifyToken],controller.peripheral)
    .put([hasToken,verifyToken,isFocal],controller.updatePeripheral)
    .delete([hasToken,verifyToken,isFocal],controller.deletePeripheral)

router.route('/insideDate')//YYYY-MM-DD
    .post([hasToken,verifyToken],controller.peripheralsInsideByDate)

router.route('/outsideDate')//YYYY-MM-DD
    .post([hasToken,verifyToken],controller.peripheralsOutsideByDate)

module.exports=router; 