import { create } from "barstil";

create({
  path: "./config.json",
  rem: true,
  typescript: true,
  helpers: true,
  output: {
    sass: "./styling/",
    script: "./src/",
  },
});