import { keys as analytics } from "@repo/analytics/keys";
import { keys as auth } from "@repo/auth/keys";
import { keys as database } from "@repo/database/keys";
import { keys as email } from "@repo/email/keys";
import { keys as core } from "@repo/next-config/keys";
import { keys as observability } from "@repo/observability/keys";
import { keys as payments } from "@repo/payments/keys";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  extends: [
    auth(),
    analytics(),
    core(),
    database(),
    email(),
    observability(),
    payments(),
  ],
  server: {
    ENCRYPTION_KEY: z.string().optional(),
    RAILWAY_API_TOKEN: z.string().optional(),
    RAILWAY_PROJECT_ID: z.string().optional(),
    RAILWAY_ENVIRONMENT_ID: z.string().optional(),
    CRON_SECRET: z.string().optional(),
  },
  client: {},
  runtimeEnv: {
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    RAILWAY_API_TOKEN: process.env.RAILWAY_API_TOKEN,
    RAILWAY_PROJECT_ID: process.env.RAILWAY_PROJECT_ID,
    RAILWAY_ENVIRONMENT_ID: process.env.RAILWAY_ENVIRONMENT_ID,
    CRON_SECRET: process.env.CRON_SECRET,
  },
});
