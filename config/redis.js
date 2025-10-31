const IORedis = require('ioredis');

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const redisConnectionOptions = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
};

const redis = new IORedis(redisUrl);

redis.on('connect', () =>{
    console.log('Redis Connected');
});
redis.on('error', (err) =>{
    console.error('Redis connection error:', err);
});

const SLUG_SET_KEY = 'availableSlugs';

module.exports = {
    redis,
    SLUG_SET_KEY,
    redisConnectionOptions,
};