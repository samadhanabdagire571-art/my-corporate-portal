import * as dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || '4000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'corporate-work-portal-super-secret-jwt-key-2025',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  DATABASE_URL: process.env.DATABASE_URL || '',
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  REDIS_URL: process.env.REDIS_URL || '',
  AI_PROVIDER: process.env.AI_PROVIDER || 'local-rules', // 'local-rules' | 'openai' | 'gemini' | 'anthropic'
  AI_API_KEY: process.env.AI_API_KEY || '',
  RATE_LIMIT_TTL: parseInt(process.env.RATE_LIMIT_TTL || '60', 10), // 60 seconds
  RATE_LIMIT_LIMIT: parseInt(process.env.RATE_LIMIT_LIMIT || '120', 10), // 120 reqs/min
};
