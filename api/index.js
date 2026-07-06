// Vercel Serverless Function entry point
// Imports the built Fastify app from blog-backend/dist/vercel-handler
const mod = require('../blog-backend/dist/vercel-handler')

// 默认导出即请求处理函数（真实 req/res 转发给 Fastify，支持 SSE 流式）
module.exports = mod.default || mod
// 关闭 Vercel 内置 body 解析，交给 Fastify 处理，保证 SSE 与请求体正常
module.exports.config = mod.config
