import { readFileSync } from 'fs';
import { resolve } from 'path';
import { z } from 'zod';

// Load .env file (lightweight dotenv — no extra dependency)
try {
  const envPath = resolve(process.cwd(), '.env');
  const content = readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
} catch {
  // .env file is optional — env vars may already be set
}

const ConfigSchema = z.object({
  port: z.coerce.number().default(3000),
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  databaseUrl: z.string().min(1, 'DATABASE_URL is required'),
  clientOrigin: z.string().default('http://localhost:5173'),
});

const env = {
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  databaseUrl: process.env.DATABASE_URL,
  clientOrigin: process.env.CLIENT_ORIGIN,
};

const parsed = ConfigSchema.safeParse(env);

if (!parsed.success) {
  console.error('[Config] Invalid environment configuration:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = parsed.data;
export type Config = typeof config;
