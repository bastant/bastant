import { create } from "@bastant/barstil";

create({
  path: "./config.json",
  rem: true,
  typescript: true,
  helpers: true,
  output: {
    sass: "./src/styling/",
    script: "./src/styling",
  },
});
