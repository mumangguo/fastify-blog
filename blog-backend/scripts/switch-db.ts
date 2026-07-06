/**
 * 数据库切换脚本
 * 用法:
 *   npx tsx scripts/switch-db.ts sqlite       # 切换到 SQLite（默认）
 *   npx tsx scripts/switch-db.ts mysql         # 切换到 MySQL
 *   npx tsx scripts/switch-db.ts postgresql    # 切换到 PostgreSQL（Vercel）
 *
 * 切换后需要执行:
 *   npx prisma generate
 *   npx prisma migrate dev  (首次使用或模型变更时)
 */
import fs from 'fs'
import path from 'path'

const dbType = process.argv[2] || 'sqlite'

if (!['sqlite', 'mysql', 'postgresql'].includes(dbType)) {
  console.error(`不支持的数据库类型: ${dbType}，仅支持 sqlite、mysql 或 postgresql`)
  process.exit(1)
}

const schemaDir = path.join(__dirname, '..', 'prisma')
const schemaFile = path.join(schemaDir, 'schema.prisma')
const templateFile = path.join(schemaDir, `schema.${dbType}.prisma`)

if (!fs.existsSync(templateFile)) {
  console.error(`找不到模板文件: ${templateFile}`)
  process.exit(1)
}

fs.copyFileSync(templateFile, schemaFile)
console.log(`已切换到 ${dbType} 模式，schema.prisma 已更新`)

// 更新 .env 中的 DATABASE_PROVIDER
const envFile = path.join(__dirname, '..', '.env')
if (fs.existsSync(envFile)) {
  let env = fs.readFileSync(envFile, 'utf-8')
  const providerLine = `DATABASE_PROVIDER="${dbType}"`
  if (env.includes('DATABASE_PROVIDER=')) {
    env = env.replace(/DATABASE_PROVIDER=.*/, providerLine)
  } else {
    env = providerLine + '\n' + env
  }
  fs.writeFileSync(envFile, env)
  console.log(`已更新 .env 中 DATABASE_PROVIDER="${dbType}"`)
}

console.log(`\n下一步操作:`)
if (dbType === 'postgresql') {
  console.log(`  1. 确保 .env 中 DATABASE_URL 指向 PostgreSQL 连接字符串，例如:`)
  console.log(`     DATABASE_URL="postgresql://user:password@host:5432/db?pgbouncer=true&connect_timeout=15"`)
  console.log(`  2. npx prisma generate`)
  console.log(`  3. npx prisma db push  (首次部署推荐) 或 npx prisma migrate dev --name init`)
} else if (dbType === 'mysql') {
  console.log(`  1. 确保 .env 中 DATABASE_URL 指向 MySQL 连接字符串，例如:`)
  console.log(`     DATABASE_URL="mysql://root:password@localhost:3306/blog_db"`)
  console.log(`  2. npx prisma generate`)
  console.log(`  3. npx prisma migrate dev --name init`)
} else {
  console.log(`  1. 确保 .env 中 DATABASE_URL="file:./dev.db"`)
  console.log(`  2. npx prisma generate`)
}
