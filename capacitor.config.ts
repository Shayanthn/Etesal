import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ir.etesal.app',
  appName: 'اتصال | Etesal',
  webDir: 'dist',
  server: {
    allowNavigation: ["etesal.aetherai.ir"],
    androidScheme: 'https',
    cleartext: false
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#080a0f',
      androidSplashResourceName: 'splash',
      showSpinner: false
    }
  }
};

export default config;
