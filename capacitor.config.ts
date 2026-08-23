import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.hdofoot.app",
  appName: "HDOFOOT",
  server: {
    url: "https://hdofoot.vercel.app",
    cleartext: false,
  },
};

export default config;
