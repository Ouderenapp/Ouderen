import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'nl.buurtconnect.app',
  appName: 'BuurtConnect',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  ios: {
    contentInset: 'always'
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
