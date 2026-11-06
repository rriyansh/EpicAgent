import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const blankToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const envSchema = z
  .object({
    PORT: z.coerce.number().default(4000),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    DATABASE_URL: z.string().min(1),
    JWT_SECRET: z.string().min(1),
    JWT_EXPIRES_IN: z.string().default("7d"),
    ENCRYPTION_KEY: z.string().min(1),
    LLM_PROVIDER: z.string().default("openai"),
    LLM_API_KEY: z.preprocess(blankToUndefined, z.string().optional()),
    LLM_BASE_URL: z.string().url().default("https://api.openai.com/v1"),
    LLM_MODEL: z.string().default("gpt-4o-mini"),
    SUPABASE_URL: z.preprocess(blankToUndefined, z.string().url().optional()),
    SUPABASE_ANON_KEY: z.preprocess(blankToUndefined, z.string().min(20).optional()),
    SUPABASE_JWT_SECRET: z.preprocess(blankToUndefined, z.string().min(16).optional()),
    API_KEY_PEPPER: z.preprocess(blankToUndefined, z.string().min(32).optional()),
    CORS_ORIGIN: z.string().default("http://localhost:5173"),
    LOG_LEVEL: z.string().default("info"),
  })
  .superRefine((value, ctx) => {
    if (value.NODE_ENV !== "production") return;
    const required: Array<[keyof typeof value, string]> = [
      ["SUPABASE_URL", "SUPABASE_URL"],
      ["SUPABASE_ANON_KEY", "SUPABASE_ANON_KEY"],
      ["API_KEY_PEPPER", "API_KEY_PEPPER"],
    ];
    for (const [key, label] of required) {
      if (!value[key]) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [key], message: `${label} is required in production` });
      }
    }
    if (value.CORS_ORIGIN.trim() === "" || value.CORS_ORIGIN === "*") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["CORS_ORIGIN"],
        message: "CORS_ORIGIN must be an explicit origin in production",
      });
    }
    if (value.JWT_SECRET.length < 32 || value.JWT_SECRET.includes("change-me")) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["JWT_SECRET"], message: "JWT_SECRET is too weak" });
    }
    if (value.ENCRYPTION_KEY.length < 32 || value.ENCRYPTION_KEY.includes("change-me")) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["ENCRYPTION_KEY"], message: "ENCRYPTION_KEY is too weak" });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export function supabaseConfigured() {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_ANON_KEY);
}
