import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // build-time generated embed of this site's own sources
    "src/experience/os/sources.generated.ts",
  ]),
  {
    // The 3D layer drives three.js objects imperatively from useFrame
    // (positions, uniforms, instance buffers). That is the react-three-fiber
    // model; the React Compiler's immutability heuristic does not apply to
    // GPU resources that are created once and mutated every frame.
    files: ["src/experience/**/*.{ts,tsx}"],
    rules: {
      "react-hooks/immutability": "off",
    },
  },
]);

export default eslintConfig;
