import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        watch: {
            usePolling: true,
        },
        host: "0.0.0.0",
        port: 5000,
        proxy: {
            "/api": {
                target: "http://api:8080",
                changeOrigin: true,
                secure: false,
            },
        },
        strictPort: true,
    },
    resolve: {
        alias: {
            "react-transition-group/TransitionGroupContext":
                "react-transition-group/cjs/TransitionGroupContext",
        },
    },
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: ["./src/test/setup.ts"],
        css: false,
        coverage: {
            provider: "v8",
            reporter: ["text", "text-summary"],
            include: ["src/hooks/**", "src/components/**"],
        },
    },
});
