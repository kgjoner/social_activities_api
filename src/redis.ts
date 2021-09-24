//eslint-disable-next-line
const redis = require('promise-redis')();

const redisClient = redis.createClient({
	host: process.env.REDIS_URL,
	port: process.env.REDIS_PORT,
	password: process.env.REDIS_KEY,
});

export default redisClient;
