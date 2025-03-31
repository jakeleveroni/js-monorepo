import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import { getCommitSha } from "@ldlabs/utils";
import { resolve } from "path";

export default defineConfig(async () => {
  return {
    plugins: [react()],

    // Configure server options
    server: {
      port: 3000,
      proxy: {
        "/api": "http://localhost:5177",
      },
    },

    build: {
      outDir: "dist/client",
      target: "es2020",
      sourcemap: true,
      rollupOptions: {
        input: resolve(__dirname, "src/client/main.tsx"),
        output: {
          // Generate a simpler filename structure
          entryFileNames: "main.js",
          chunkFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash].[ext]",
          // Split vendor code into separate chunk
          manualChunks: {
            vendor: ["react", "react-dom", "react/jsx-runtime"],
          },
        },
      },
    },

    define: {
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
      COMMIT: JSON.stringify(await getCommitSha()),
    },

    optimizeDeps: {
      include: ["react", "react-dom"],
    },

    esbuild: {
      jsx: "automatic",
      jsxInject: `import React from 'react'`,
    },
  } satisfies UserConfig;
});
