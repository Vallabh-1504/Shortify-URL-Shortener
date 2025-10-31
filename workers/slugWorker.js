require('dotenv').config();
const {Worker} = require('bullmq');
const {nanoid} = require('nanoid');
const mongoose = require('mongoose');
const {redis, SLUG_SET_KEY, redisConnectionOptions} = require('../config/redis');
const UrlModel = require('../models/Url');
const { SLUG_QUEUE_NAME } = require('../queues/slugQueue');

const dbUrl = process.env.MONGO_URL || "mongodb://localhost:27017/URLshortener";

mongoose.connect(dbUrl);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Worker: Mongoose connection error: '));
db.once('open', () => {
    console.log('Worker: Mongoose connected');
});

const TARGET_COUNT = 100;
const THRESHOLD = 50;

const processor = async (job) =>{
    console.log(`processing job ${job.id} (${job.name})`);

    try{
        const currentCount = await redis.scard(SLUG_SET_KEY);

        if(currentCount < THRESHOLD){
            const slugsToGenerateCount = TARGET_COUNT - currentCount;

            let generatedCount = 0;
            const newSlugs = new Set();

            for(let i = 0; i < slugsToGenerateCount * 2 && generatedCount < slugsToGenerateCount; i++){
                const shortId = nanoid(8);

                // check in DB
                const existsInDb = await UrlModel.findOne({
                    shortId: shortId
                }).lean();

                if(!existsInDb){
                    newSlugs.add(shortId);
                    generatedCount++;
                }
            }

            if(newSlugs.size > 0){
                await redis.sadd(SLUG_SET_KEY, ...Array.from(newSlugs));
                console.log(`Added ${newSlugs.size} slugs to cache`);
            }
        }
        else console.log('Slug set refill not needed');
    }
    catch(err){
        console.error('Error in slug refill job: ', err);
        throw err;
    }
};

console.log('Starting slug worker');

const slugWorker = new Worker(SLUG_QUEUE_NAME, processor, {
    connection: redisConnectionOptions,
    limiter: {
        max: 5,
        duration: 24 * 60 * 60 * 1000
    }
});

slugWorker.on('completed', (job) =>{
    console.log(`Job ${job.id} completed`);
})
slugWorker.on('failed', (job, err) =>{
    console.error(`Job ${job.id} failed with error: ${err.message}`);
});