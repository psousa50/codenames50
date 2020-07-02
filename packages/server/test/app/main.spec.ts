import request from "supertest"
import { createExpressApp, configureRoutes } from "../../src/app/main"
import { buildTestExpressEnvironment } from "../helpers"

// eslint-disable-next-line jest/expect-expect
it("/health", async () => {
  const app = createExpressApp()
  configureRoutes(app, buildTestExpressEnvironment())

  await request(app).get("/api/v1/health").expect(200, { result: "Ok" })
})
