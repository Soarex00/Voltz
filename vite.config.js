import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import flowbiteReact from "flowbite-react/plugin/vite";

export default defineConfig({
  plugins: [react(), tailwindcss(), flowbiteReact()],
  server: {
    proxy: Object.fromEntries(
      [
        "/auth",
        "/products",
        "/orders",
        "/admin",
        "/recommendations",
        "/health",
      ].map((path) => [path, "http://localhost:3333"]),
    ),
  },
});
