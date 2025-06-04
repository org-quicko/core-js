import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { builtinModules, createRequire } from "module";
import dts from "rollup-plugin-dts";
import { glob } from 'glob';
import path from "path";

const require = createRequire(import.meta.url);
const pkg = require("./package.json");

// Configuration for environment-specific modules
const environmentConfig = {
  nodeOnly: [
    'logger'
  ],
  
  browserOnly: [],
  
  universal: [
    'beans',
    'exceptions', 
    'types',
    'utils',
  ]
};

const getAllSourceModules = () => {
    return glob.sync([
      'src/*/index.ts',
      'src/*/*/index.ts'
    ]).map((module) => path.posix.normalize(module).replace(/\\/g, "/"));
}

const getModulesForEnvironment = (environment = 'node') => {
  const allModules = getAllSourceModules();

  return allModules.filter((module) => {
    const modulePath = module.replace('src/', '').replace('/index.ts', '');
    const topLevelModule = modulePath.split('/')[0];
    
    // Check if it's a node-only module
    const isNodeOnly = environmentConfig.nodeOnly.includes(topLevelModule);
    
    // Check if it's a browser-only module  
    const isBrowserOnly = environmentConfig.browserOnly.includes(topLevelModule);
    
    // Filter based on target environment
    switch (environment) {
      case 'node':
        return !isBrowserOnly; // Include universal + node-only
      case 'browser':
        return !isNodeOnly; // Include universal + browser-only
      case 'universal':
        return !isNodeOnly && !isBrowserOnly; // Only universal
      default:
        return true;
    }
  })
}

const getExternals = (environment = 'node') => {
  const base = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {})
  ]

  if(environment === 'node') {
    return [
      ...base,
      ...builtinModules,
      ...builtinModules.map((builtinModule) => `node:${builtinModule}`)
    ]
  }

  return base;
}



export default [
  // Bundle for CommonJS and ESM with preserved module structure
  {
    input: [
      "build/node/index.ts",
      ...getModulesForEnvironment('node')
    ],
    external: getExternals('node'),
    plugins: [
      resolve({
        extensions: [".js", ".ts"],
        preferBuiltins: true
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
      ...getModulesForEnvironment('browser')
    ],
    external: getExternals('browser'),
    plugins: [
      resolve({
        browser: true,
        extensions: [".js", ".ts"]
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
    ...getAllSourceModules()
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