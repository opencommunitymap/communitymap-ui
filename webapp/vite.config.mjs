import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'REACT_APP_');

  return {
    plugins: [react({ jsxRuntime: 'classic' })],
    envPrefix: ['VITE_', 'REACT_APP_'],
    server: {
      port: 3000,
    },
    preview: {
      port: 3000,
    },
    build: {
      // Firebase Hosting currently deploys webapp/build.
      outDir: 'build',
      // Semantic UI 2.4 contains selectors rejected by Lightning CSS.
      cssMinify: 'esbuild',
    },
    define: {
      // Compatibility for the existing app and SDK. Keep this explicit so no
      // server-only environment variables can leak into the browser bundle.
      'process.env': JSON.stringify({
        NODE_ENV: mode === 'production' ? 'production' : 'development',
        REACT_APP_GOOGLE_API_KEY: env.REACT_APP_GOOGLE_API_KEY || '',
        REACT_APP_OCM_ENV: env.REACT_APP_OCM_ENV || '',
        REACT_APP_CLOUDINARY_CLOUD_NAME:
          env.REACT_APP_CLOUDINARY_CLOUD_NAME || '',
        REACT_APP_CLOUDINARY_UPLOAD_PRESET_LOGO:
          env.REACT_APP_CLOUDINARY_UPLOAD_PRESET_LOGO || '',
      }),
    },
  };
});
