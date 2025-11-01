const rateLimit = require('express-rate-limit');
const {ipKeyGenerator} = require('express-rate-limit');

module.exports.loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 5,
    keyGenerator: (req) => req.body.email || ipKeyGenerator(req),
    message: 'Too many login attempts for this account. Try again later.'
});

module.exports.signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hr
    max: 10,
    keyGenerator: ipKeyGenerator,
    message: 'Too many signup attempts from this ip. Try again later.'    
});

module.exports.globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: ipKeyGenerator,
    message: "Too many requests from this IP, try again later."
});