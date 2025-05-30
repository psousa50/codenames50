import convict from "convict"

export interface AppConfig {
  mongodb: {
    uri: string
  }
  nodeEnv: string
  port: number
  boardWidth: number
  boardHeight: number
  allowedOrigins: string[]
}

export const config = convict<AppConfig>({
  mongodb: {
    uri: {
      default: "mongodb://localhost:27017/codenames50",
      doc: "",
      env: "MONGODB_URI",
    },
  },
  nodeEnv: {
    default: "development",
    doc: "Running in an environment, or on a developer machine? Mainly used to decide log structure etc",
    env: "NODE_ENV",
    format: ["production", "development", "test"],
  },
  port: {
    default: 3001,
    doc: "",
    env: "PORT",
    format: "port",
  },
  boardWidth: 5,
  boardHeight: 5,
  allowedOrigins: {
    default: ["http://localhost:4000", "https://codenames50.netlify.app"],
    doc: "Comma-separated list of allowed origins for CORS",
    env: "ALLOWED_ORIGINS",
    format: (val: string[] | string) => {
      if (typeof val === "string") {
        return val.split(",").map(origin => origin.trim())
      }
      return val
    },
  },
})

export const isDev = (c: AppConfig) => c.nodeEnv === "development"
