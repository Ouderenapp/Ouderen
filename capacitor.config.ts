import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'nl.buurtactiviteiten.app',
  appName: 'Buurtactiviteiten',
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
