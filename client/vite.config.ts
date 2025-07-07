import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],

    // Development server configuration
    server: {
      port: 3000,
      // TODO [ ]: decide whether set to true or localhost
      host: true, // Allow external connections: true - Don't allow: localhost
      proxy: {
        "/api/auth": {
          target: "http://user-auth-service:8083",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/auth/, "/auth"),
        },
        "/api/programs": {
          target: "http://program-catalog-service:8080",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/programs/, "/programs"),
        },
        "/api/study-plans": {
          target: "http://study-plan-service:8081",
          changeOrigin: true,
          secure: false,
          rewrite: (path) =>
            path.replace(/^\/api\/study-plans/, "/study-plans"),
        },
        "/api/ai-advisor": {
          target: "http://ai-advisor-service:8082",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/ai-advisor/, "/ai-advisor"),
        },
      },
    },

    // Build configuration
    build: {
      outDir: "dist",
      sourcemap: mode === "development",
      minify: mode === "production",
      target: "esnext",
      // Skip type checking during build in CI
      rollupOptions: {
        // Ignore TypeScript errors during build
        onwarn: (warning, warn) => {
          if (warning.code === "TYPESCRIPT_ERROR") return;
          warn(warning);
        },
      },
    },
    esbuild: {
      // Skip type checking in production builds
      logOverride: { "this-is-undefined-in-esm": "silent" },
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
