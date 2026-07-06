/**
 * 部署时自动把 Prisma schema 推到线上数据库（建表 / 追加字段）。
 *
 * 为什么需要这个 wrapper：
 * - Neon 集成注入的连接串里，DATABASE_URL 是带 pgbouncer 的池化连接，
 *   而 prisma db push / migrate 必须用直连（DATABASE_URL_UNPOOLED），
 *   否则事务性 DDL 会失败或行为不可预期。
 * - 用小脚本比在 npm script 里内联 shell 变量插值更跨平台、更清晰。
 *
 * 安全设计：
 * - 不加 --accept-data-loss，遇到"可能丢数据"的 schema 变更时 push 会失败，
 *   构建也会失败，避免线上数据被静默破坏。
 * - 未设 DATABASE_URL_UNPOOLED 时（比如本地跑 build:prepare）直接跳过，
 *   不阻塞其他步骤。
 * - 已在流水线里被 prisma generate 生成过 client，这里加 --skip-generate 省时间。
 */
import { spawnSync } from 'child_process'
import path from 'path'

const unpooled = process.env.DATABASE_URL_UNPOOLED
if (!unpooled) {
  console.log('[db-push] DATABASE_URL_UNPOOLED 未设置，跳过（非部署环境）')
  process.exit(0)
}

console.log('[db-push] 正在把 schema 推到线上数据库…')

// 用本地 node_modules/.bin/prisma 而非 npx，避免 npx 找不到本地版本时下载最新版
// 造成的版本漂移（见项目历史：npx 曾漂移到 prisma@7.8 与 5.x schema 不兼容）
const prismaBin = path.resolve(
  __dirname,
  '..',
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'prisma.cmd' : 'prisma'
)

const result = spawnSync(
  prismaBin,
  ['db', 'push', '--skip-generate', '--schema=prisma/schema.prisma'],
  {
    stdio: 'inherit',
    // 用直连覆盖池化连接，仅在这个子进程生效
    env: { ...process.env, DATABASE_URL: unpooled },
    cwd: path.resolve(__dirname, '..'),
  }
)

process.exit(result.status ?? 1)
