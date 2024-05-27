import logger from "@utils/logger";
import z from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production", "staging"]),
  PORT: z.string().default("3005"),
  DB_USERNAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.string().default("5432"),
  OPENAI_API_KEY: z.string().optional(),
  OPEN_AI_MODEL: z.string().optional(),
  OPEN_AI_API_ENDPOINT: z.string().optional(),
  CORS_ORIGINS: z.string().refine(
    (value) => {
      if (process.env.NODE_ENV === "production" && !value) {
        return false;
      }
      return true;
    },
    {
      message: "CORS_ORIGINS is required in production",
    }
  ),
  IS_PRODUCTION: z.boolean().default(false),
  IS_DEVELOPMENT: z.boolean().default(false),
  IS_TEST: z.boolean().default(false),
});

export type EnvSchemaType = z.infer<typeof envSchema>;

const env = envSchema.safeParse({
  ...process.env,
  PROJECT_ROOT: process.cwd(),
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",
  IS_TEST: process.env.NODE_ENV === "test",
  CURRENT_ENV: process.env.NODE_ENV,
}) as
  | { success: true; data: EnvSchemaType }
  | { success: false; error: z.ZodError };

const validateEnv = (): EnvSchemaType => {
  if (!env.success) {
    logger.error(env?.error?.format(), "❌ Invalid environment variables:");
    process.exit(1);
  }
  return env.data;
};

export default validateEnv();
