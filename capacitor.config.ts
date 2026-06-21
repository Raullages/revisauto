import { config as loadEnv } from "dotenv";
import type { CapacitorConfig } from "@capacitor/cli";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env.capacitor", override: true });

const serverUrl =
  process.env.CAPACITOR_SERVER_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.NEXT_PUBLIC_SITE_URL;

const config: CapacitorConfig = {
  appId: "com.pessoauto.app",
  appName: "PessoAuto",
  webDir: "dist/capacitor",
  server: serverUrl
    ? {
        url: serverUrl,
        cleartext: serverUrl.startsWith("http://"),
      }
    : undefined,
};

export default config;
