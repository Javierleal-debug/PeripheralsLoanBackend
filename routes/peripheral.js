const express = require('express');
const router = express.Router();
const axios = require('axios');
const credentials = require('../config/credentials.json');
const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');
const controller = require('../controllers/peripheral.controller');
const { hasToken,verifyToken, isFocal, isSecurity } = require('../middleware/authJwt');
const { verifyPeripheralBodyMaxLength } = require('../middleware/verifyInput')



router.route('/')
    .get([hasToken,verifyToken],controller.peripherals)
    .post([hasToken,verifyToken,isFocal,verifyPeripheralBodyMaxLength],controller.addPeripheral)
    //.delete([hasToken,verifyToken,isFocal],controller.deletePeripherals)

router.route('/:serialNumber')
    .get([hasToken,verifyToken],controller.peripheral)
    .put([hasToken,verifyToken,isFocal,verifyPeripheralBodyMaxLength],controller.updatePeripheral)
    .delete([hasToken,verifyToken,isFocal],controller.deletePeripheral)

router.route('/inOutDate')//YYYY-MM-DD  
    .post([hasToken,verifyToken],controller.peripheralsInAndOutByDate) //solo usa un parametro del body(la verificacion está dentro de la funcion)

router.route('/request')
    .post([hasToken,verifyToken,verifyPeripheralBodyMaxLength],controller.peripheralRequest)

router.route('/loan')
    .post([hasToken,verifyToken,isFocal,verifyPeripheralBodyMaxLength],controller.peripheralLoan)

router.route('/reset')
    .post([hasToken,verifyToken,isFocal,verifyPeripheralBodyMaxLength],controller.peripheralReset)

router.route('/return')
    .post([hasToken,verifyToken,isFocal,verifyPeripheralBodyMaxLength],controller.peripheralReturn)

router.route('/securityAuthorize')
    .post([hasToken,verifyToken,isSecurity,verifyPeripheralBodyMaxLength],controller.peripheralSecurityAuthorize)

router.route('/byEmail')
    .post([hasToken,verifyToken],controller.peripheralsByEmail)

module.exports=router; 