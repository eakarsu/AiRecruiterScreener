// Simple in-memory rate limiter
const rateLimitStore = new Map();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.windowStart > data.windowMs) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

const createRateLimiter = ({ windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests, please try again later.' } = {}) => {
  return (req, res, next) => {
    const key = req.ip + ':' + req.baseUrl;
    const now = Date.now();

    let record = rateLimitStore.get(key);

    if (!record || (now - record.windowStart > windowMs)) {
      record = { count: 0, windowStart: now, windowMs };
      rateLimitStore.set(key, record);
    }

    record.count++;

    const remaining = Math.max(0, max - record.count);
    const resetTime = new Date(record.windowStart + windowMs);

    res.set('X-RateLimit-Limit', max);
    res.set('X-RateLimit-Remaining', remaining);
    res.set('X-RateLimit-Reset', resetTime.toISOString());

    if (record.count > max) {
      return res.status(429).json({
        error: message,
        retryAfter: Math.ceil((record.windowStart + windowMs - now) / 1000),
      });
    }

    next();
  };
};

// Pre-configured limiters
const generalLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 100 });
const authLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many auth attempts, please try again later.' });
const aiLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 30, message: 'Too many AI requests, please try again later.' });
const exportLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many export requests, please try again later.' });

module.exports = {
  createRateLimiter,
  generalLimiter,
  authLimiter,
  aiLimiter,
  exportLimiter,
};
