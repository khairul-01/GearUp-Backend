// tsup config file
// import { defineConfig } from "tsup";

// export default defineConfig({
//   entry: ["src/index.ts"],
//   outDir: "dist",
//   format: ["esm"],
//   splitting: false,
//   sourcemap: true,
//   clean: true
// });

import { defineConfig } from "tsup";

export default defineConfig({

 entry: ["src/server.ts"],

 format: ["esm"], // Keep this as ESM

 target: "es2023",

 outDir: "dist",

 clean: true,

 bundle: true,

 splitting: false,

 sourcemap: true,

 // Add this banner to shim require() for CJS dependencies

 banner: {

  js: `

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  `,

 },

});

