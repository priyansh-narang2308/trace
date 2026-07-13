import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.UPSTASH_REDIS_REST_URL?.replace('https://', ''),
  port: 6379,
  password: process.env.UPSTASH_REDIS_REST_TOKEN,
  tls: {},
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

export default redis;
