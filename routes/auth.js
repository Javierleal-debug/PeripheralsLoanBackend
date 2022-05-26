const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth.controller');
const { hasToken,verifyToken, isFocal } = require('../middleware/authJwt');
const {authJwt} = require('../middleware/index');

router.route('/login')
    .post(
        controller.signin
    );
router.route('/signup')
    .post(
        [hasToken,verifyToken,isFocal],
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