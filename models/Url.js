const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
    shortId:{
        type: String,
        required: true,
        unique: true
    },
    redirectURL:{
        type:String,
        required: true
    },
    visitHistory: [
        {
            timestamp: { type: Date, default: Date.now}, 
            ipAddress: {type: String},
            // userAgent: {type: String},
            location: {
                country: {type: String},
                region: {type: String},
                city: {type: String},
                ll: {type: [Number], index: '2d'},
            }
        },
    ],
    expiresAt:{
        type: Date,
        required: true,
    },
    qrCode:{
        type: String,
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
});

const UrlModel = mongoose.model('url', urlSchema);

module.exports = UrlModel;