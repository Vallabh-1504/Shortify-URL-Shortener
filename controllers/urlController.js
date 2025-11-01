const UrlModel = require('../models/Url');
const {nanoid} = require('nanoid');
const QRCode = require('qrcode');
const AppError = require('../utilities/AppError');
const baseUrl = process.env.BASE_URL || 'http://localhost:8000';
const {redis, SLUG_SET_KEY} = require('../config/redis');


const getUrlAndCheckOwner = async (urlId, userId) =>{
    const url = await UrlModel.findById(urlId);
    if(!url){
        throw new AppError('URL not found', 404);
    }
    if(url.createdBy.toString() !== userId){
        throw new AppError('you do not have permission to edit this URL', 403);
    }
    return url;
};

module.exports.renderHome = (req, res)=> {
    res.render('index', {title: 'Home'});
}

module.exports.createUrl = async (req, res)=> {
    let shortId;

    shortId = await redis.spop(SLUG_SET_KEY);

    if(!shortId){
        // fallback
        console.warn('Slug set empty or redis down. Genrarting on the fly');

        while(true){
            shortId = nanoid(8);
            const exists = await UrlModel.findOne({shortId});
            if(!exists) break;
        }
    }

    const {redirectURL} = req.body;
    const expiryDuration = 1000 * 60 * 60 * 24 * 7;

    const fullUrl = `${baseUrl}/r/${shortId}`;
    const qrCode = await QRCode.toDataURL(fullUrl);

    const url = new UrlModel({
        shortId: shortId,
        redirectURL: redirectURL,
        createdBy: req.session.userId,
        expiresAt: new Date(Date.now() + expiryDuration),
        qrCode: qrCode,
    });

    await url.save();
    req.flash('success', `Short URL created Succesfully`);
    res.redirect('/urls');
};

module.exports.redirectShortUrl = async (req, res)=> {
    const {shortId} = req.params;
    const entry = await UrlModel.findOne({shortId});
    if(!entry){
        throw new AppError('Short URL not found', 404);
    }
    if(entry.expiresAt < new Date()){
        throw new AppError('This short URL has expired', 410);
    }

    entry.visitHistory.push({timestamp: new Date()});
    await entry.save();
    res.redirect(entry.redirectURL);
}

module.exports.dashboard = async (req, res)=> {
    const userId = req.session.userId;
    const allUrls = await UrlModel.find({createdBy: userId});

    const updatedUrls = [];
    const now = new Date();

    for(const url of allUrls){
        // expiry time
        const expiresAt = new Date(url.expiresAt);
        const difference = expiresAt - now;
        const daysLeft = Math.floor(difference / (1000 * 60 * 60 * 24));

        updatedUrls.push({
            ...url.toObject(),
            isExpired: daysLeft < 0,
            daysLeft: daysLeft >= 0 ? daysLeft : 0,
        });
        
    }

    res.render('dashboard', {title: 'Dashboard', allUrls: updatedUrls});
};

module.exports.deleteUrl = async (req, res) =>{
    const {id} = req.params;

    await getUrlAndCheckOwner(id, req.session.userId);
    await UrlModel.findByIdAndDelete(id);
    req.flash('success', 'URL Successfully deleted');
    res.redirect('/urls');
};

module.exports.renderShowPage = async (req, res) =>{
    const {id} = req.params;
    const url = await getUrlAndCheckOwner(id, req.session.userId);

    // Format date for <input type="date"> which requires YYYY-MM-DD
    const expiryDateFormatted = url.expiresAt.toISOString().split('T')[0];

    res.render('show', { 
        title: 'URL Details', 
        url, 
        expiryDateFormatted,
    });
};

module.exports.updateRedirectUrl = async (req, res) =>{
    const {id} = req.params;
    const {redirectURL} = req.body;
    const url = await getUrlAndCheckOwner(id, req.session.userId);

    url.redirectURL = redirectURL;
    await url.save();

    req.flash('success', 'Redirect URL updated successfully!');
    res.redirect(`/url/${id}`);
};

module.exports.updateShortId = async (req, res) =>{
    const {id} = req.params;
    const {shortId} = req.body;

    // Check if the new shortId is already taken
    const exists = await UrlModel.findOne({shortId: shortId});

    if(exists && exists._id.toString() !== id) {
        req.flash('error', 'That custom ID is already in use. Please try another.');
        return res.redirect(`/url/${id}`);
    }

    const url = await getUrlAndCheckOwner(id, req.session.userId);
    url.shortId = shortId;

    // update qrCode
    const fullUrl = `${baseUrl}/r/${shortId}`;
    url.qrCode = await QRCode.toDataURL(fullUrl);

    await url.save();

    req.flash('success', 'Short ID and RQ Code updated successfully!');
    res.redirect(`/url/${id}`);
};

module.exports.updateExpiry = async (req, res) =>{
    const {id} = req.params;
    const {expiresAt} = req.body;
    const url = await getUrlAndCheckOwner(id, req.session.userId);

    url.expiresAt = new Date(expiresAt);
    await url.save();

    req.flash('success', 'Expiry date updated successfully!');
    res.redirect(`/url/${id}`);
};

module.exports.resetClicks = async (req, res) =>{
    const {id} = req.params;
    const url = await getUrlAndCheckOwner(id, req.session.userId);

    url.visitHistory = []; // Reset the array
    await url.save();

    req.flash('success', 'Click count has been reset to 0.');
    res.redirect(`/url/${id}`);
};