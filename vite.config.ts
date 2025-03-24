import path from "path";
import { defineConfig } from "vite";
import topLevelAwait from "vite-plugin-top-level-await";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";
import { config } from "dotenv";

config({ path: path.resolve(__dirname, "../.env") });

// https://vite.dev/config/
export default defineConfig({
    plugins: [wasm(), topLevelAwait(), react()],
    optimizeDeps: {
        exclude: ["onnxruntime-node", "@anush008/tokenizers"],
    },
    build: {
        commonjsOptions: {
            exclude: ["onnxruntime-node", "@anush008/tokenizers"],
        },
        rollupOptions: {
            external: ["onnxruntime-node", "@anush008/tokenizers"],
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        host: true,
        port: 5173,
        headers: {
            'Content-Security-Policy': `
                default-src 'self';
                connect-src 'self' 
                    http://localhost:3500 
                    http://localhost:3000 
                    http://localhost:5000 
                    http://localhost:8080
                    http://localhost:8081
                    http://localhost:5173 
                    http://localhost:3001
                    https://api.openai.com 
                    wss://api.openai.com 
                    https://*.openai.com 
                    wss://*.openai.com;
                img-src 'self' data: blob: https://*;
                script-src 'self' 'unsafe-inline' 'unsafe-eval';
                style-src 'self' 'unsafe-inline';
                media-src 'self' blob: mediastream:;
                worker-src 'self' blob:;
            `.replace(/\s+/g, ' ').trim()
        },
        proxy: {
            "/api": {
                target: `http://localhost:${process.env.SERVER_PORT || 5000}`,
                changeOrigin: true,
                secure: false,
                ws: true,
                configure: (proxy, _options) => {
                    proxy.on('error', (err, _req, _res) => {
                        console.log('proxy error', err);
                    });
                    proxy.on('proxyReq', (proxyReq, req, _res) => {
                        console.log('Sending Request to the Target:', req.method, req.url);
                    });
                    proxy.on('proxyRes', (proxyRes, req, _res) => {
                        console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
                    });
                }
            },
            "^/v1/realtime/sessions": {
                target: "https://api.openai.com",
                changeOrigin: true,
                secure: true,
                configure: (proxy, _options) => {
                    proxy.on('error', (err, _req, _res) => {
                        console.log('OpenAI proxy error:', err);
                    });
                    proxy.on('proxyReq', (proxyReq, req, _res) => {
                        proxyReq.setHeader('Authorization', `Bearer ${process.env.VITE_OPENAI_API_KEY}`);
                    });
                }
            }
        },
        cors: {
            origin: '*',
            methods: ['GET', 'POST', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true
        }
    },
});