import { builtinModules } from "node:module";
import type { AddressInfo } from "node:net";
import type { ConfigEnv, Plugin, UserConfig } from "vite";
import pkg from "./package.json";

export const builtins = [
  "electron",
  ...builtinModules.map((m) => [m, `node:${m}`]).flat(),
];

export const external = [
  ...builtins,
  ...Object.keys(
    "dependencies" in pkg ? (pkg.dependencies as Record<string, unknown>) : {},
  ),
];

export function getBuildConfig(env: ConfigEnv): UserConfig {
  const { root, mode, command } = env;

  return {
    root,
    mode,
    build: {
      // Prevent multiple builds from interfering with each other.
      emptyOutDir: false,
      // 🚧 Multiple builds may conflict.
      outDir: ".vite/build",
      watch: command === "serve" ? {} : null,
      minify: command === "build",
    },
    clearScreen: false,
  };
}

export function getDefineKeys(names: string[]) {
  const define: { [name: string]: VitePluginRuntimeKeys } = {};

  return names.reduce((acc, name) => {
    const NAME = name.toUpperCase();
    const keys: VitePluginRuntimeKeys = {
      VITE_DEV_SERVER_URL: `${NAME}_VITE_DEV_SERVER_URL`,
      VITE_NAME: `${NAME}_VITE_NAME`,
    };

    return { ...acc, [name]: keys };
  }, define);
}

export function pluginExposeRenderer(name: string): Plugin {
  const { VITE_DEV_SERVER_URL } = getDefineKeys([name])[name];

  return {
    name: "vite:expose-renderer",
    configureServer(server) {
      process.viteDevServers ??= {};
      // Expose server for preload scripts hot reload.
      process.viteDevServers[name] = server;

      server.httpServer?.once("listening", () => {
        const addressInfo = server.httpServer!.address() as AddressInfo;
        // Expose env constant for main process use.
        process.env[VITE_DEV_SERVER_URL] =
          `http://localhost:${addressInfo?.port}`;
      });
    },
  };
}

export function pluginHotRestart(command: "reload" | "restart"): Plugin {
  return {
    name: "vite:hot-restart",
    closeBundle() {
      if (command === "reload") {
        // Check if viteDevServers exists before iterating
        if (process.viteDevServers && Object.keys(process.viteDevServers).length > 0) {
          for (const server of Object.values(process.viteDevServers)) {
            // Preload scripts hot reload.
            server.ws.send({ type: "full-reload" });
          }
        }
      } else {
        // Main process hot restart.
        process.stdin.emit("data", "rs");
      }
    },
  };
}
