const {Queue} = require('bullmq');
const {redisConnectionOptions} = require('../config/redis');

const SLUG_QUEUE_NAME = 'slug-generation';

// Create the queue instance
const slugQueue = new Queue(SLUG_QUEUE_NAME, {
    connection: redisConnectionOptions,
});

const scheduleSlugRefill = async () =>{
    // try{
    //     // Remove any old repeatable jobs to avoid duplicates on restart
    //     await slugQueue.removeRepeatable('refill-slugs',{every: 24 * 60 * 60 * 1000});

    //     // Add the repeatable job: runs every 5 minutes
    //     await slugQueue.add('refill-slugs', {}, {
    //         repeat: {every: 24 * 60 * 60 * 1000},
    //         jobId: 'refill-slugs',
    //     });
    //     console.log('Scheduled slug refill job');

    //     await slugQueue.add('refill-slugs-startup', {});
    // }

    try {
        const jobName = 'refill-slugs';
        const repeatOpts = {
            every: 24 * 60 * 60 * 1000, // 5-minute interval (Recommended)
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