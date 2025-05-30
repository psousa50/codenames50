import request from "supertest"
import { createExpressApp, configureRoutes } from "../../src/app/main"
import { buildTestExpressEnvironment } from "../helpers"

it("should return 200 OK for /health endpoint", async () => {
  const app = createExpressApp()
  configureRoutes(app, buildTestExpressEnvironment())

  await request(app).get("/api/v1/health").expect(200, { result: "Ok" })
})
