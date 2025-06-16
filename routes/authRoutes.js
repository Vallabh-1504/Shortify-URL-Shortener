const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const catchAsync = require('../utilities/catchAsync');
const validate = require('../middlewares/validateInput');
const {signupSchema, loginSchema} = require('../validators/schemas');

// signup
router.get('/signup', auth.renderSignup);
router.post('/signup', validate(signupSchema), catchAsync(auth.signup));

// login
router.get('/login', auth.renderLogin);
router.post('/login', validate(loginSchema), catchAsync(auth.login));

// logout
router.get('/logout', auth.logout);

module.exports = router;