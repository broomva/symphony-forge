import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () =>
  createEnv({
    server: {
      SYMPHONY_API_URL: z.string().optional(),
      SYMPHONY_API_TOKEN: z.string().optional(),
    },
    emptyStringAsUndefined: true,
    runtimeEnv: {
      SYMPHONY_API_URL: process.env.SYMPHONY_API_URL,
      SYMPHONY_API_TOKEN: process.env.SYMPHONY_API_TOKEN,
    },
  });
