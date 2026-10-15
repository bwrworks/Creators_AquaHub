import { AuthConfig } from "convex/server";

declare const process: {
  env: Record<string, string | undefined>;
};

export default {
  providers: [
    {
      type: "customJwt",
      issuer: `https://${process.env.SUPABASE_PROJECT_REF || "demo"}.supabase.co/auth/v1`,
      applicationID: "authenticated",
      jwks: `https://${process.env.SUPABASE_PROJECT_REF || "demo"}.supabase.co/auth/v1/.well-known/jwks.json`,
      algorithm: "ES256",
    },
  ],
} satisfies AuthConfig;
