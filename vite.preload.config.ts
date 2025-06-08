import path from 'path';
import type { ConfigEnv, UserConfig } from "vite";
import { defineConfig, mergeConfig } from "vite";
import { getBuildConfig, external, pluginHotRestart } from "./vite.base.config";

// https://vitejs.dev/config
export default defineConfig((env) => {
  const config: UserConfig = {
    build: {
      rollupOptions: {
        external,
        // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
        input: path.resolve(__dirname, 'src/preload.ts'),
        output: {
          format: "cjs",
          // It should not be split chunks.
          inlineDynamicImports: true,
          entryFileNames: "[name].js",
          chunkFileNames: "[name].js",
          assetFileNames: "[name].[ext]",
        },
      },
    },
    plugins: [pluginHotRestart("reload")],
  };

  return mergeConfig(getBuildConfig(env), config);
});
