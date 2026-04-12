import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig(function () {
    var _a, _b, _c, _d, _e, _f;
    var env = globalThis;
    var repositoryName = (_d = (_c = (_b = (_a = env.process) === null || _a === void 0 ? void 0 : _a.env) === null || _b === void 0 ? void 0 : _b.GITHUB_REPOSITORY) === null || _c === void 0 ? void 0 : _c.split("/")[1]) !== null && _d !== void 0 ? _d : "jianli";
    var isGithubPagesBuild = ((_f = (_e = env.process) === null || _e === void 0 ? void 0 : _e.env) === null || _f === void 0 ? void 0 : _f.GITHUB_ACTIONS) === "true";
    return {
        base: isGithubPagesBuild ? "/".concat(repositoryName, "/") : "/",
        plugins: [react()],
    };
});
