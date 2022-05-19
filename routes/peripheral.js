const express = require('express');
const router = express.Router();
const axios = require('axios');
const credentials = require('../config/credentials.json');
const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');
const controller = require('../controllers/peripheral.controller');
const { hasToken,verifyToken, isFocal, isSecurity } = require('../middleware/authJwt');



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

router.route('/request')
    .post([hasToken,verifyToken],controller.peripheralRequest)

router.route('/loan')
    .post([hasToken,verifyToken,isFocal],controller.peripheralLoan)

router.route('/reset')
    .post([hasToken,verifyToken,isFocal],controller.peripheralReset)

router.route('/return')
    .post([hasToken,verifyToken,isFocal],controller.peripheralReturn)

router.route('/securityAuthorize')
    .post([hasToken,verifyToken,isSecurity],controller.peripheralSecurityAuthorize)

module.exports=router; 