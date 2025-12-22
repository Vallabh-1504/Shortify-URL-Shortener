const {Queue} = require('bullmq');
const IORedis = require('ioredis');
const {redisConfig} = require('../config/redis');

const VISIT_QUEUE_NAME = 'visit-tracking';

const connection = new IORedis(redisConfig.url, redisConfig.options);

const visitQueue = new Queue(VISIT_QUEUE_NAME, {
    connection: connection
});

module.exports = { visitQueue, VISIT_QUEUE_NAME };