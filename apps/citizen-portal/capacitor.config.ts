import type { CapacitorConfig } from '@capacitor/cli';

// Dev mode is ON only when CAP_DEV=1 is set in the terminal.
// Without it, the app uses the bundled "dist" build (safe for release).
declare const process: { env: Record<string, string | undefined> };
const isDev = process.env.CAP_DEV === '1';
const config: CapacitorConfig = {
  appId: 'com.kmc.smartwater',
  appName: 'KMC Smart Water',
  webDir: 'dist',
  ...(isDev && {
    server: {
      // 10.0.2.2 = your PC, as seen from the Android emulator
      url: 'http://10.0.2.2:5173',
      cleartext: true,
    },
  }),
};

export default config;
