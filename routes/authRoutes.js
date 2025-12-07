const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const catchAsync = require('../utilities/catchAsync');
const validate = require('../middlewares/validateInput');
const {signupSchema, loginSchema} = require('../validators/schemas');
const { loginLimiter, signupLimiter } = require('../middlewares/rateLimiter');
const {otpRequestSchema, otpVerifySchema} = require('../validators/schemas');

// signup
router.get(
    '/signup', 
    auth.renderSignup
);

router.post(
    '/signup', 
    signupLimiter, 
    validate(signupSchema), 
    catchAsync(auth.signup)
);

// login
router.get(
    '/login', 
    auth.renderLogin
);

router.post(
    '/login', 
    loginLimiter, 
    validate(loginSchema), 
    catchAsync(auth.login)
);

// logout
router.get(
    '/logout', 
    auth.logout
);

// Oauth setup
router.get(
    '/google', 
    auth.googleAuth
);
router.get(
    '/auth/google/callback', 
    catchAsync(auth.googleCallback)
);

// OTP login
router.get(
    '/login/otp', 
    auth.renderOtpLogin
);

router.post('/login/send-otp', 
    loginLimiter,
    validate(otpRequestSchema), 
    catchAsync(auth.sendOtp),
);

router.post('/login/verify-otp', 
    loginLimiter, 
    validate(otpVerifySchema), 
    catchAsync(auth.verifyOtp),
);

module.exports = router;