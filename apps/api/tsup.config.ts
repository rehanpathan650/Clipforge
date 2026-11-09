import { defineConfig } from "tsup";
import core from "../../packages/core/package.json";

// Bundle our workspace package, keep every third-party dependency external.
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],
  target: "node20",
  clean: true,
  sourcemap: true,
  noExternal: ["@clipforge/core"],
  external: Object.keys(core.dependencies),
});
