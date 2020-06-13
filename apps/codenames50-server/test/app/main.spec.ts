import request from "supertest"
import { buildTestExpressEnvironment } from "../helpers"
import { createExpressApp } from "../../src/app/main"

it("/health", async () => {
  const app = createExpressApp(buildTestExpressEnvironment({}))

  await request(app).get("/api/v1/health").expect(200, { result: "Ok" })
})
