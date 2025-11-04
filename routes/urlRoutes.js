const express = require('express');
const router = express.Router();
const url = require('../controllers/urlController');
const catchAsync = require('../utilities/catchAsync');
const validate = require('../middlewares/validateInput');
const Schemas = require('../validators/schemas');
const requireLogin = require('../middlewares/requireLogin');

// app.get- to input url
router.get('/', url.renderHome);

router.post('/url', validate(Schemas.newUrlSchema), requireLogin,  catchAsync(url.createUrl));

router.get('/r/:shortId', catchAsync(url.redirectShortUrl));

router.get('/urls', requireLogin, catchAsync(url.dashboard));

router.get('/url/:id', requireLogin, catchAsync(url.renderShowPage));

router.get('/url/:id/analytics', requireLogin, catchAsync(url.getAnalytics));

router.post(
    '/url/:id/edit/redirect', 
    requireLogin, 
    validate(Schemas.updateRedirectSchema), 
    catchAsync(url.updateRedirectUrl)
);

router.post(
    '/url/:id/edit/shortId', 
    requireLogin, 
    validate(Schemas.customShortIdSchema), 
    catchAsync(url.updateShortId)
);

router.post(
    '/url/:id/edit/expiry', 
    requireLogin, 
    validate(Schemas.updateExpirySchema), 
    catchAsync(url.updateExpiry),
);

router.post(
    '/url/:id/reset', 
    requireLogin, 
    catchAsync(url.resetClicks),
);

router.post('/delete/:id', catchAsync(url.deleteUrl));

module.exports = router;


