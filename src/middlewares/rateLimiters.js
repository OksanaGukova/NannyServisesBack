import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';
import createHttpError from 'http-errors';
import { getEnvVar } from '../utils/getEnvVar.js';

// Redis client (налаштуйте REDIS_URL у .env)
const redis = new Redis(getEnvVar('REDIS_URL'));

// Загальний ліміт для API (наприклад 100 запитів / 15 хв)
export const apiRateLimiter = new RateLimiterRedis({
  storeClient: redis,
  points: 100,
  duration: 15 * 60,
  keyPrefix: 'rl_api',
});

// Ліміт для спроб логіну (пер IP)
export const loginIpLimiter = new RateLimiterRedis({
  storeClient: redis,
  points: 10, // 10 спроб за 15 хв з одного IP
  duration: 15 * 60,
  blockDuration: 60 * 60, // блокуємо IP на 1 год
  keyPrefix: 'rl_login_ip',
});

// Ліміт для спроб логіну по email (пер користувача)
export const loginUserLimiter = new RateLimiterRedis({
  storeClient: redis,
  points: 5, // 5 невдалих спроб для конкретного email за 15 хв
  duration: 15 * 60,
  blockDuration: 60 * 60, // блокувати на 1 год
  keyPrefix: 'rl_login_user',
});

// Ліміт для запитів на відновлення пароля (запобігаємо спаму емейлів)
export const resetPasswordLimiter = new RateLimiterRedis({
  storeClient: redis,
  points: 3, // 3 запити на email за годину
  duration: 60 * 60,
  blockDuration: 2 * 60 * 60, // заблокувати на 2 години
  keyPrefix: 'rl_reset_pwd',
});

// express-помічник щоб обернути лімітер у middleware
export const rateLimitMiddleware = (limiter, getKey = (req) => req.ip) => {
  return async (req, res, next) => {
    const key = getKey(req);
    try {
      await limiter.consume(key);
      return next();
    } catch (rlRejected) {
      // rlRejected.msBeforeNext дає час до розблокування
      const retryAfter = Math.ceil((rlRejected.msBeforeNext || 0) / 1000);
      res.setHeader('Retry-After', String(retryAfter));
      return next(createHttpError(429, 'Too Many Requests'));
    }
  };
};
