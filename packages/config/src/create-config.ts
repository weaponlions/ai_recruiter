import { z } from 'zod';

/**
 * Creates a typed, validated config object from a Zod schema.
 * Throws a descriptive error on startup if any env vars are missing/invalid.
 *
 * @example
 * const AppConfig = z.object({
 *   PORT: z.coerce.number().default(3000),
 *   DATABASE_URL: z.string().url(),
 * });
 * export const config = createConfig(AppConfig);
 */
export function createConfig<T extends z.ZodTypeAny>(
  schema: T,
  env: Record<string, string | undefined> = process.env,
): z.infer<T> {
  const result = schema.safeParse(env);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  [${issue.path.join('.')}]: ${issue.message}`)
      .join('\n');

    throw new Error(`❌ Environment validation failed:\n${formatted}`);
  }

  return result.data as z.infer<T>;
}
