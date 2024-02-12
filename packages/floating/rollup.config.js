import withSolid from "@bastant/rollup-preset";

export default withSolid({
  input: "src/index.ts",
  targets: ["esm", "cjs"],
  mappingName: "willow",
});
