const {Queue} = require('bullmq');
const IORedis = require('ioredis');
const {redisConfig} = require('../config/redis');

const SLUG_QUEUE_NAME = 'slug-generation';

const connection = new IORedis(redisConfig.url, redisConfig.options);

const slugQueue = new Queue(SLUG_QUEUE_NAME, {
    connection: connection,
});

const scheduleSlugRefill = async () =>{
    try {
        const jobName = 'refill-slugs';
        const repeatOpts = {
            every: 24 * 60 * 60 * 1000,
        };

        // remove job with smae name and exact repeat options.
        await slugQueue.removeJobScheduler(jobName, repeatOpts);

        // Add the new repeatable job
        await slugQueue.add(jobName, {}, {
            repeat: repeatOpts,
        });
        
        console.log('Scheduled slug refill job.');

        // Add a job to run immediately on startup
        await slugQueue.add('refill-slugs-startup', {});
    }
    catch(err){
        console.error('Error Scheduling slug refill job:', err);
    }
}

module.exports = {slugQueue, scheduleSlugRefill, SLUG_QUEUE_NAME};