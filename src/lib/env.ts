/**
 * Environment variable validation using Zod.
 * Validates at runtime to catch missing/invalid env vars early.
 */

import { z } from 'zod';

const envSchema = z.object({
  VITE_APP_NAME: z.string().min(1).optional(),
  VITE_APP_URL: z.string().url().optional(),
  MODE: z.enum(['development', 'production', 'test']).default('development'),
  DEV: z.boolean().default(false),
  PROD: z.boolean().default(false),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validate environment variables and return typed env object.
 * Throws if validation fails in production.
 */
export function validateEnv(): Env {
  const env = {
    VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
    VITE_APP_URL: import.meta.env.VITE_APP_URL,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
  };

  const result = envSchema.safeParse(env);

  if (!result.success) {
    const errors = result.error.format();
    console.error('Environment validation failed:', errors);

    if (import.meta.env.PROD) {
      throw new Error('Invalid environment configuration');
    }

    // Return defaults in development if validation fails
    return {
      VITE_APP_NAME: undefined,
      VITE_APP_URL: undefined,
      MODE: 'development' as const,
      DEV: true,
      PROD: false,
    };
  }

  return result.data;
}

/**
 * Validated environment variables.
 * Access this instead of import.meta.env for type safety.
 */
export const env = validateEnv();
