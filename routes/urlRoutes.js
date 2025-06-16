const express = require('express');
const router = express.Router();
const url = require('../controllers/urlController');
const catchAsync = require('../utilities/catchAsync');
const validate = require('../middlewares/validateInput');
const {urlSchema} = require('../validators/schemas');
const requireLogin = require('../middlewares/requireLogin');

// app.get- to input url
router.get('/', url.renderHome);

router.post('/url', validate(urlSchema), catchAsync(url.createUrl));
router.get('/r/:shortId', catchAsync(url.redirectShortUrl));
router.get('/urls', requireLogin, catchAsync(url.dashboard));
router.post('/delete/:id', catchAsync(url.deleteUrl));

module.exports = router;


