import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { builtinModules, createRequire } from "module";
import dts from "rollup-plugin-dts";

const require = createRequire(import.meta.url);
const pkg = require("./package.json");

export default [
  // Bundle for CommonJS and ESM with preserved module structure
  {
    input: [
      "build/node/index.ts",
      "src/beans/index.ts",
      "src/exceptions/index.ts",
      "src/logger/index.ts",
      "src/types/index.ts",
      "src/utils/index.ts",
    ],
    external: [...Object.keys(pkg.dependencies || {}), ...builtinModules],
    plugins: [
      resolve({
        extensions: [".js", ".ts"],
        preferBuiltins: true,
        modulesOnly: true,
      }),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: false,
        outDir: undefined,
        rootDir: "./",
        exclude: ["node_modules", "dist"],
      }),
    ],
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
  },

  {
    // build for browser
    input: [
      "build/browser/index.ts",
      "src/beans/index.ts",
      "src/exceptions/index.ts",
      "src/types/index.ts",
      "src/utils/index.ts",
    ],
    external: [...Object.keys(pkg.dependencies || {}), ...builtinModules],
    plugins: [
      resolve({
        browser: true,
        extensions: [".js", ".ts"],
        modulesOnly: true,
      }),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: false,
        rootDir: "./",
        outDir: undefined,
        exclude: ["node_modules", "dist"],
      }),
    ],
    output: [
      {
        dir: "dist/browser",
        format: "esm",
        sourcemap: true,
        preserveModules: true,
        preserveModulesRoot: "src",
      },
    ],
  },

  // Generate declaration files
  {
    input: [
    "index.ts",
    "src/beans/index.ts",
    "src/exceptions/index.ts",
    "src/logger/index.ts",
    "src/types/index.ts",
    "src/utils/index.ts",
    "src/utils/date/index.ts"
  ],
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
