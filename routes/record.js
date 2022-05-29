const express = require('express');
const router = express.Router();
const controller = require('../controllers/record.controller');
const {hasToken,verifyToken,isAdmin} = require('../middleware/authJwt')

router.route('/')
    .get([hasToken,verifyToken,isAdmin],controller.getRecords)
    .post([hasToken,verifyToken,isAdmin],controller.getRecordsByDate)