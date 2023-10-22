import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

import Path from "path";

export default defineConfig({
  plugins: [solid()],
});
