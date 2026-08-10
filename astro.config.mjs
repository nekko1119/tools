// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://nekko1119.github.io",
  base: "/tools/",
  vite: {
    plugins: [tailwindcss()],
  },
});
