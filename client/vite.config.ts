import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],

    // Development server configuration
    server: {
      port: 5173, // Use standard Vite port for development
      host: true, // Allow external connections
      proxy: {
        "/api": {
          target: "http://localhost:8083", // Correct backend port
          changeOrigin: true,
          secure: false,
        },
      },
    },

    // Build configuration
    build: {
      outDir: "dist",
      sourcemap: mode === "development",
      minify: mode === "production",
      target: "esnext",
    },

    // Environment variable handling
    define: {
      __DEV__: JSON.stringify(mode === "development"),
      __PROD__: JSON.stringify(mode === "production"),
    },

    // Ensure proper mode detection
    mode: mode,
  };
});
