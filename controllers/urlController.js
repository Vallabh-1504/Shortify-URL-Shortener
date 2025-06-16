const UrlModel = require('../models/Url');
const {nanoid} = require('nanoid');
const QRCode = require('qrcode');
const AppError = require('../utilities/AppError');
const baseUrl = process.env.BASE_URL || 'http://localhost:8001';

module.exports.renderHome = (req, res)=> {
    res.render('index', {title: 'Home'});
}

module.exports.createUrl = async (req, res)=> {
    if(!req.session.userId){
        req.flash('info', 'you must be logged to create a short URL');
        return res.redirect('/login');
    }

    let shortId;
    // if shortId gets repeated
    while(true){
        shortId = nanoid(8);
        const exists = await UrlModel.findOne({shortId});

        if(!exists) break;
    }

    const {redirectURL} = req.body;
    const expiryDuration = 1000 * 60 * 60 * 24 * 7;

    const url = new UrlModel({
        shortId: shortId,
        redirectURL: redirectURL,
        createdBy: req.session.userId,
        expiresAt: new Date(Date.now() + expiryDuration),
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

    // Generating QRcode on go
    const updatedUrls = [];
    const now = new Date();

    for(const url of allUrls){
        // qrcode
        const fullUrl = `${baseUrl}/r/${url.shortId}`;
        const qrCode = await QRCode.toDataURL(fullUrl);

        // expiry time
        const expiresAt = new Date(url.expiresAt);
        const difference = expiresAt - now;
        const daysLeft = Math.floor(difference / (1000 * 60 * 60 * 24));

        updatedUrls.push({
            ...url.toObject(),
            qrImage: qrCode,
            isExpired: daysLeft < 0,
            daysLeft: daysLeft >= 0 ? daysLeft : 0,
        });
        
    }

    res.render('dashboard', {title: 'Dashboard', allUrls: updatedUrls});
};

module.exports.deleteUrl = async (req, res) =>{
    const {id} = req.params;
    await UrlModel.findByIdAndDelete(id);
    req.flash('success', 'URL Successfully deleted');
    res.redirect('/urls');
};