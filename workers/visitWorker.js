require('dotenv').config();
const {Worker} = require('bullmq');
const mongoose = require('mongoose');
const axios = require('axios');
const IORedis = require('ioredis');
const {redisConfig} = require('../config/redis');
const UrlModel = require('../models/Url');
const {VISIT_QUEUE_NAME} = require('../queues/visitQueue');

const dbUrl = process.env.MONGO_URL || "mongodb://localhost:27017/URLshortener1";

mongoose.connect(dbUrl);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Worker: Mongoose connection error'));
db.once('open', () =>{
    console.log('Worker: Mongoose connected');
});

const processor = async (job) =>{
    let {urlId, ip} = job.data;
    console.log(`Processing visit for URL ID: ${urlId}`);

    try{
        let geo = null;

        const response = await axios.get(`http://ip-api.com/json/${ip}`);
        if(response && response.data.status === 'success'){
            geo = {
                country: response.data.country,
                region: response.data.regionName,
                city: response.data.city,
                ll: [response.data.lat, response.data.lon],
            };
        }

        const visitData = {
            timestamp: new Date(),
            ipAddress: ip,
            // userAgent: userAgent,
            location: geo,
        };

        await UrlModel.findByIdAndUpdate(urlId, {
            $push: { visitHistory: visitData }
        });
    }
    catch(err){
        console.error(`Error processing visit job ${job.id}:`, err.message);
    }
};

const workerConnection = new IORedis(redisConfig.url, redisConfig.options);

const visitWorker = new Worker(VISIT_QUEUE_NAME, processor, {
    connection: workerConnection,
    limiter: {
        max: 45,
        duration: 60 * 1000,
    }
});

visitWorker.on('failed', (job, err) =>{
    console.error(`Visit job ${job.id} failed: ${err.message}`);
});

console.log('Visit Worker started...');