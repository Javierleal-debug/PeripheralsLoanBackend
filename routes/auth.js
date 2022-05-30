const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth.controller');
const { hasToken, verifyToken, isFocal } = require('../middleware/authJwt');
const {verifyNoAuthSQLInjection} = require('../middleware/verifyInput');
const {authJwt} = require('../middleware/index');

router.route('/login')
    .post(
        [verifyNoAuthSQLInjection],controller.signin
    );
router.route('/signup')
    .post(
        [hasToken,verifyToken,verifyNoAuthSQLInjection,isFocal],
        controller.signup
    )
router.route('/hasAccess')
    .get([hasToken,verifyToken],
        controller.hasAccess)

router.route('/userType')
    .get(
        [hasToken,verifyToken],controller.usertype
    )

module.exports = router;