import convict from "convict"

export interface AppConfig {
  mongodb: {
    uri: string
  }
  nodeEnv: string
  port: number
  boardWidth: number
  boardHeight: number
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
})

export const isDev = (c: AppConfig) => c.nodeEnv === "development"
