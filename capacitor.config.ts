import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.1030f469875d417ba01b8fc69ec10950',
  appName: 'cv-star-generator',
  webDir: 'dist',
  server: {
    url: 'http://192.168.0.7:8080',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false
    }
  }
};

export default config;