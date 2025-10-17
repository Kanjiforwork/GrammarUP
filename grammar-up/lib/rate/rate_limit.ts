import { Ratelimit } from '@upstash/ratelimit'
import { redis } from './redis'

export const aiTutorRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '24 h'),
  prefix: 'ratelimit:ai_tutor',
})
