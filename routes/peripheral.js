const express = require('express');
const router = express.Router();
const controller = require('../controllers/peripheral.controller');
const { hasToken,verifyToken, isAdmin , isFocal, isSecurity } = require('../middleware/authJwt');
const { verifyPeripheralBodyMaxLength,verifySerialNumberNotDuplicated, verifyNoSQLInjection } = require('../middleware/verifyInput');
const record = require('../middleware/createRecord');



router.route('/')
    .get([hasToken,verifyToken],controller.peripherals)
    .post([hasToken,verifyToken,isFocal,verifyNoSQLInjection,verifyPeripheralBodyMaxLength,verifySerialNumberNotDuplicated,controller.addPeripheral,record.recordGetInfo],record.createRecord)
    //.delete([hasToken,verifyToken,isFocal],controller.deletePeripherals)

router.route('/:serialNumber')
    .get([hasToken,verifyToken],controller.peripheral)
    .delete([hasToken,verifyToken,isFocal,controller.deletePeripheral,record.recordGetInfo],record.createRecord)

router.route('/inOutDate')//YYYY-MM-DD  
    .post([hasToken,verifyToken],controller.peripheralsInAndOutByDate) //solo usa un parametro del body(la verificacion está dentro de la funcion)

router.route('/inOutDateData')
    .post([hasToken,verifyToken,isFocal],controller.peripheralsInAndOutByDateData)

router.route('/request')
    .post([hasToken,verifyToken,isFocal,verifyPeripheralBodyMaxLength,verifyNoSQLInjection],controller.peripheralRequest)

router.route('/loan')
    .post([hasToken,verifyToken,isFocal,verifyPeripheralBodyMaxLength,verifyNoSQLInjection,controller.peripheralLoan,record.recordGetInfo],record.createRecord)

router.route('/reset')
    .post([hasToken,verifyToken,isFocal,verifyPeripheralBodyMaxLength,verifyNoSQLInjection,controller.peripheralReset,record.recordGetInfo],record.createRecord)

router.route('/return')
    .post([hasToken,verifyToken,isFocal,verifyPeripheralBodyMaxLength,verifyNoSQLInjection,controller.peripheralReturn,record.recordGetInfo],record.createRecord)

router.route('/securityAuthorize')
    .post([hasToken,verifyToken,isSecurity,verifyPeripheralBodyMaxLength,verifyNoSQLInjection,controller.peripheralSecurityAuthorize,record.recordGetInfo],record.createRecord)

router.route('/byEmail')
    .post([hasToken,verifyToken,verifyNoSQLInjection],controller.peripheralsByEmail)

module.exports=router; 