import build from './app'

const PORT = Number(process.env.PORT) || 3000

async function start() {
  const app = await build()
  try {
    await app.listen({ port: PORT, host: '0.0.0.0' })
    app.log.info(`Server listening on http://localhost:${PORT}`)
    app.log.info(`Swagger UI available at http://localhost:${PORT}/docs`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
