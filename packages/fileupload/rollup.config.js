import withSolid from "rollup-preset-solid";

import styles from "rollup-plugin-styles";

export default withSolid({
  input: "src/index.ts",
  targets: ["esm", "cjs"],

  plugins: [
    styles({
      mode: "inject",
      modules: true,
    }),
  ],
});
