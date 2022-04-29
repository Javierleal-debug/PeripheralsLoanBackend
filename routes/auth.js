const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth.controller');
const { hasToken,verifyToken } = require('../middleware/authJwt');
const {authJwt} = require('../middleware/index');

router.route('/login')
    .post(
        controller.signin
    );
router.route('/signup')
    .post(
        [hasToken,verifyToken],
        controller.signup
    )
router.route('/hasAccess')
    .get([hasToken,verifyToken],
        controller.hasAccess)

module.exports = router;