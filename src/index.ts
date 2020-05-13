import * as dotenv from "dotenv"
import socketIo from "socket.io"
import { buildExpressAdapter } from "./environment"
import { logDebug } from "./utils/debug"
import { createExpressApp } from "./app/main"
import { socketHandler } from "./app/sockets/handler"

dotenv.config()

const exitProcess = (error: Error) => {
  logDebug("Shutting down app", error.message)
  process.exit(1)
}

const startApplication = async () => {
  try {
    const expressAdapter = await buildExpressAdapter()

    const app = createExpressApp(expressAdapter)

    const port = process.env.PORT || expressAdapter.config.port
    const server = app.listen(port)

    const io = socketIo(server, {})
    io.on("connection", socketHandler(expressAdapter.adapters.domain, io))

    server.on("checkContinue", (__, res) => {
      res.writeContinue()
    })
    server.once("error", (error: Error) => {
      io.close()
      exitProcess(error)
    })
  } catch (error) {
    exitProcess(error)
  }
}

startApplication().then(
  () => logDebug("App Started"),
  e => logDebug(`Error: ${e.message}`),
)
