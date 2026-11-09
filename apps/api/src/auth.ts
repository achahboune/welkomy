import { betterAuth } from "better-auth/minimal";

export function createAuth(env: Env) {
  return betterAuth({
    database: env.DB,
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    emailAndPassword: { enabled: true, requireEmailVerification: false },
    trustedOrigins: [env.APP_ORIGIN, env.BETTER_AUTH_URL].filter(Boolean) as string[],
    user: { modelName: "auth_users" },
    session: { modelName: "auth_sessions" },
    account: { modelName: "auth_accounts" },
    verification: { modelName: "auth_verifications" },
  });
}
