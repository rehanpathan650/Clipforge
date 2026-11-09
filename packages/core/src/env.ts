import { config } from "dotenv";
import path from "node:path";
import { z } from "zod";

// Load the repo-root .env in development (no-op in production where real env vars are set).
config({ path: path.resolve(process.cwd(), "../../.env") });
config();

const bool = (def: "true" | "false") =>
  z.enum(["true", "false"]).default(def).transform((v) => v === "true");

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  LOG_LEVEL: z.string().default("info"),

  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().default("redis://localhost:6379"),

  S3_ENDPOINT: z.string().url().optional(),
  S3_PUBLIC_ENDPOINT: z.string().url().optional(),
  S3_REGION: z.string().default("us-east-1"),
  S3_BUCKET: z.string().min(1),
  S3_ACCESS_KEY_ID: z.string().min(1),
  S3_SECRET_ACCESS_KEY: z.string().min(1),
  S3_FORCE_PATH_STYLE: bool("true"),

  API_PORT: z.coerce.number().default(4000),
  WEB_ORIGIN: z.string().default("http://localhost:3000"),
  TRUST_PROXY: z.coerce.number().default(0),

  MAX_UPLOAD_MB: z.coerce.number().default(2048),
  MAX_VIDEO_MINUTES: z.coerce.number().default(120),

  COOKIE_DOMAIN: z.string().optional(),
  SESSION_DAYS: z.coerce.number().default(30),
  SIGNUP_BONUS_CREDITS: z.coerce.number().int().min(0).default(0),
  MAX_ACTIVE_PROJECTS: z.coerce.number().int().min(1).default(3),
  RATE_LIMIT_GLOBAL: z.coerce.number().default(600),
  RERENDER_LIMIT_PER_HOUR: z.coerce.number().default(30),

  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

  SOURCE_RETENTION_DAYS: z.coerce.number().default(7),
  CLIP_RETENTION_DAYS: z.coerce.number().default(30),

  METRICS_TOKEN: z.string().optional(),
  METRICS_PORT: z.coerce.number().default(9100),
  SENTRY_DSN: z.string().optional(),

  PYTHON_BIN: z.string().default("python3"),
  WORKER_CONCURRENCY: z.coerce.number().default(1),
  RERENDER_CONCURRENCY: z.coerce.number().default(1),
  TRANSCRIBE_API_KEY: z.string().optional(),
  TRANSCRIBE_BASE_URL: z.string().default("https://api.groq.com/openai/v1"),
  TRANSCRIBE_MODEL: z.string().default("whisper-large-v3-turbo"),
  ANTHROPIC_API_KEY: z.string().optional(),
  CLIP_MODEL: z.string().default("claude-sonnet-5-5"),
  YTDLP_COOKIES_FILE: z.string().optional(),
  YTDLP_PROXY: z.string().optional(),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment configuration:");
  for (const issue of parsed.error.issues) console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  process.exit(1);
}

export const env = parsed.data;
