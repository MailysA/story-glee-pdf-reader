import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.f6eb86e205fe40ae93b071bc4bdc9e2e',
  appName: 'story-glee-pdf-reader',
  webDir: 'dist',
  server: {
    url: 'https://f6eb86e2-05fe-40ae-93b0-71bc4bdc9e2e.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;