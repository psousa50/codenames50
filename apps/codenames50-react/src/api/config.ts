import { config } from "../utils/config"

const HOST = config.irnUrl
const PORT = config.irnPort
const host = `${HOST}${PORT ? `:${PORT}` : ""}`
export const apiUrl = `${host}/api/v1`
