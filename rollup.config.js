import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import { globSync } from "glob";
import path from "path";
import { nodeExternals } from "rollup-plugin-node-externals";
const EXTENSIONS = [".js", ".ts"];

const environmentConfig = {
  nodeOnly: ["logger"],
  browserOnly: [],
  universal: ["beans", "exceptions", "types", "utils"],
};

const getAllSourceModules = () => {
  return globSync(["src/*/index.ts", "src/*/*/index.ts"]).map((module) =>
    path.posix.normalize(module).replace(/\\/g, "/"),
  );
};

const getModulesForEnvironment = (environment = "node") => {
  const allModules = getAllSourceModules();

  return allModules.filter((module) => {
    const modulePath = module.replace("src/", "").replace("/index.ts", "");
    const topLevelModule = modulePath.split("/")[0];
    const isNodeOnly = environmentConfig.nodeOnly.includes(topLevelModule);
    const isBrowserOnly =
      environmentConfig.browserOnly.includes(topLevelModule);

    switch (environment) {
      case "node":
        return !isBrowserOnly;
      case "browser":
        return !isNodeOnly;
      case "universal":
        return !isNodeOnly && !isBrowserOnly;
      default:
        return true;
    }
  });
};

const createTypescriptPlugin = () =>
  typescript({
    tsconfig: "./tsconfig.json",
    declaration: false,
    rootDir: "./",
    outDir: undefined,
    exclude: ["node_modules", "dist"],
  });

const createModuleBuild = ({ input, environment, output }) => ({
  input,
  plugins: [
    nodeExternals({
      packagePath: "./package.json",
    }),
    resolve({
      extensions: EXTENSIONS,
      browser: environment === "browser",
      preferBuiltins: environment === "node",
    }),
    commonjs(),
    createTypescriptPlugin(),
  ],
  output,
});

export default [
  createModuleBuild({
    input: ["build/node/index.ts", ...getModulesForEnvironment("node")],
    environment: "node",
    output: [
      {
        dir: "dist/cjs",
        format: "cjs",
        sourcemap: true,
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].cjs",
      },
      {
        dir: "dist/esm",
        format: "esm",
        sourcemap: true,
        preserveModules: true,
        preserveModulesRoot: "src",
      },
    ],
  }),
  createModuleBuild({
    input: ["build/browser/index.ts", ...getModulesForEnvironment("browser")],
    environment: "browser",
    output: [
      {
        dir: "dist/browser",
        format: "esm",
        sourcemap: true,
        preserveModules: true,
        preserveModulesRoot: "src",
      },
    ],
  }),
  {
    input: ["index.ts", ...getAllSourceModules()],
    plugins: [dts()],
    output: [
      {
        dir: "dist/types",
        preserveModules: true,
        preserveModulesRoot: ".",
      },
    ],
  },
];
