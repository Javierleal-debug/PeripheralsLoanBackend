const express = require('express');
const router = express.Router();
const {hasToken, verifyToken, isAdmin, correctPassword} = require('../middleware/authJwt');
const {verifyNoAuthSQLInjection} = require('../middleware/verifyInput');
const controller = require('../controllers/user.controller')

router.route('/signup')
    .post(
        [hasToken,verifyToken,verifyNoAuthSQLInjection,isAdmin],
        controller.createUser
    )

router.route('/changePasswordAdmin')
    .post(
        [hasToken,verifyToken,isAdmin],controller.changePasswordAdmin
    )
router.route('/changePassword')
    .post(
        [hasToken,verifyToken,correctPassword],controller.changePassword
    )
router.route('/changeUserType')
    .post(
        [hasToken,verifyToken,isAdmin],controller.changeUserType
    )
router.route('/deleteUser')
    .post(
        [hasToken,verifyToken,isAdmin],controller.deleteUser
    )

module.exports = router;