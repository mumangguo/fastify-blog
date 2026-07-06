import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                // SSE 长连接兼容：设置较长超时（2 分钟）并开启 proxyKeepAlive
                proxyTimeout: 120000,
                timeout: 120000,
                ws: true,
                configure: function (proxy, _options) {
                    // 禁用代理超时关闭空闲连接
                    ;
                    proxy.setTimeout && proxy.setTimeout(0);
                    proxy.on('proxyReq', function (proxyReq, _req, _res) {
                        // 保持代理连接不因空闲超时而关闭
                        proxyReq.setHeader('Connection', 'keep-alive');
                        proxyReq.setTimeout(0);
                    });
                    proxy.on('error', function (err, _req, res) {
                        console.error('[proxy error]', err.message);
                        if (res && !res.headersSent) {
                            res.writeHead(502, { 'Content-Type': 'text/plain' });
                            res.end('Bad Gateway');
                        }
                    });
                },
            },
            '/uploads': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            },
        },
    },
});
