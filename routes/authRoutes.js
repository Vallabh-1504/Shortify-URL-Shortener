const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const catchAsync = require('../utilities/catchAsync');
const validate = require('../middlewares/validateInput');
const {signupSchema, loginSchema} = require('../validators/schemas');
const { loginLimiter, signupLimiter } = require('../middlewares/rateLimiter');

// signup
router.get('/signup', auth.renderSignup);
router.post('/signup', signupLimiter, validate(signupSchema), catchAsync(auth.signup));

// login
router.get('/login', auth.renderLogin);
router.post('/login', loginLimiter, validate(loginSchema), catchAsync(auth.login));

// logout
router.get('/logout', auth.logout);

// Oauth setup
router.get('/google', auth.googleAuth);
router.get('/auth/google/callback', catchAsync(auth.googleCallback));

module.exports = router;