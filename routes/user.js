const express = require('express');
const router = express.Router();
const {hasToken, verifyToken, isAdmin, correctPassword} = require('../middleware/authJwt');
const {verifyNoAuthSQLInjection, verifyEmailNotDuplicated} = require('../middleware/verifyInput');
const controller = require('../controllers/user.controller');
const { getBearerToken } = require('../middleware/bearerToken');

router.route('/')
    .get(
        [hasToken,verifyToken,isAdmin,getBearerToken],controller.getUsers
    )
router.route('/signup')
    .post(
        [hasToken,verifyToken,verifyNoAuthSQLInjection,isAdmin,getBearerToken,verifyEmailNotDuplicated],
        controller.createUser
    )
router.route('/changePasswordAdmin')
    .post(
        [hasToken,verifyToken,isAdmin,getBearerToken],controller.changePasswordAdmin
    )
router.route('/changePassword')
    .post(
        [hasToken,verifyToken,getBearerToken,correctPassword],controller.changePassword
    )
router.route('/changeUserType')
    .post(
        [hasToken,verifyToken,isAdmin,getBearerToken],controller.changeUserType
    )
router.route('/deleteUser')
    .post(
        [hasToken,verifyToken,isAdmin,getBearerToken],controller.deleteUser
    )
router.route('/:email')
    .get(
        [hasToken,verifyToken,isAdmin,getBearerToken],controller.getUser
    )
    
module.exports = router;