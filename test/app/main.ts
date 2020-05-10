import request from "supertest"
import { createApp } from "../helpers"

it("/health", async () => {
  const app = createApp({} as any)

  request(app).get("/api/v1/health").expect(200, { result: "Ok" })
})
