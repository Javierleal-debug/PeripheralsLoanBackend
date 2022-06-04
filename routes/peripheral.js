const express = require('express');
const router = express.Router();
const controller = require('../controllers/peripheral.controller');
const { hasToken,verifyToken, isAdmin , isFocal, isSecurity } = require('../middleware/authJwt');
const { verifyPeripheralBodyMaxLength, verifySerialNumberNotDuplicated, verifyNoSQLInjection, verifyPeripheralType } = require('../middleware/verifyInput');
const record = require('../middleware/createRecord');
const { getBearerToken } = require('../middleware/bearerToken');



router.route('/')
    .get([hasToken,verifyToken,getBearerToken],controller.peripherals)
    .post([hasToken,verifyToken,isFocal,verifyPeripheralType,verifyNoSQLInjection,verifyPeripheralBodyMaxLength,getBearerToken,verifySerialNumberNotDuplicated,controller.addPeripheral,record.recordGetInfo],record.createRecord)
    .delete([hasToken,verifyToken,verifyNoSQLInjection,verifyPeripheralBodyMaxLength,isFocal,getBearerToken,controller.deletePeripherals,record.recordsGetInfo],record.createRecords)

router.route('/inOutDate')//YYYY-MM-DD  
    .post([hasToken,verifyToken,getBearerToken],controller.peripheralsInAndOutByDate) //solo usa un parametro del body(la verificacion está dentro de la funcion)

router.route('/inOutDateData')
    .post([hasToken,verifyToken,isFocal,getBearerToken],controller.peripheralsInAndOutByDateData)

router.route('/request')
    .post([hasToken,verifyToken,isFocal,verifyPeripheralBodyMaxLength,verifyNoSQLInjection],getBearerToken,controller.peripheralRequest)

router.route('/loan')
    .post([hasToken,verifyToken,isFocal,verifyPeripheralBodyMaxLength,verifyNoSQLInjection,getBearerToken,controller.peripheralLoan,record.recordGetInfo],record.createRecord)

router.route('/reset')
    .post([hasToken,verifyToken,isFocal,verifyPeripheralBodyMaxLength,verifyNoSQLInjection,getBearerToken,controller.peripheralReset,record.recordGetInfo],record.createRecord)

router.route('/return')
    .post([hasToken,verifyToken,isFocal,verifyPeripheralBodyMaxLength,verifyNoSQLInjection,getBearerToken,controller.peripheralReturn,record.recordGetInfo],record.createRecord)

router.route('/securityAuthorize')
    .post([hasToken,verifyToken,isSecurity,verifyPeripheralBodyMaxLength,verifyNoSQLInjection,getBearerToken,controller.peripheralSecurityAuthorize,record.recordGetInfo],record.createRecord)

router.route('/byEmail')
    .get([hasToken,verifyToken,verifyNoSQLInjection,getBearerToken],controller.peripheralsByEmail)

router.route('/byMngrEmail')
    .get([hasToken,verifyToken,getBearerToken],controller.peripheralsByMngrEmail)

router.route('/accept/:serialNumberUrl')
    .get([getBearerToken],controller.peripheralAcceptConditions)

router.route('/:serialNumber')
    .get([hasToken,verifyToken,getBearerToken],controller.peripheral)
    .delete([hasToken,verifyToken,verifyNoSQLInjection,verifyPeripheralBodyMaxLength,isFocal,getBearerToken,controller.deletePeripheral,record.recordGetInfo],record.createRecord)

module.exports=router; 