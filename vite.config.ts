import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(() => {
  const env = globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  };
  const repositoryName = env.process?.env?.GITHUB_REPOSITORY?.split("/")[1] ?? "jianli";
  const isGithubPagesBuild = env.process?.env?.GITHUB_ACTIONS === "true";

  return {
    base: isGithubPagesBuild ? `/${repositoryName}/` : "/",
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
