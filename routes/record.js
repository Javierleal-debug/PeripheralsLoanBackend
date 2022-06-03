const express = require('express');
const router = express.Router();
const controller = require('../controllers/record.controller');
const {hasToken,verifyToken,isAdmin} = require('../middleware/authJwt');
const { getBearerToken } = require('../middleware/bearerToken');

router.route('/')
    .get([hasToken,verifyToken,isAdmin,getBearerToken],controller.getRecords)
    .post([hasToken,verifyToken,isAdmin,getBearerToken],controller.getRecordsByDate)

module.exports = router;