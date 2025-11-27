const IORedis = require('ioredis');

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const redisConnectionOptions = {
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
    tls: redisUrl.startsWith('rediss://') ? {
        rejectUnauthorized: false
    } : undefined, // tls for rediss
};

const redis = new IORedis(redisUrl, redisConnectionOptions);

redis.on('connect', () =>{
    console.log('Redis Connected');
});
redis.on('error', (err) =>{
    console.error('Redis connection error:', err);
});
redis.on('reconnecting', () =>{
    console.log('Redis Reconnecting');
});

const SLUG_SET_KEY = 'availableSlugs';

module.exports = {
    redis,
    SLUG_SET_KEY,
    redisConfig: {
        options: redisConnectionOptions,
        url: redisUrl,
    },
};