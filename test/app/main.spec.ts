import request from "supertest"
import { buildTestExpressAdapter } from "../helpers"
import { createExpressApp } from "../../src/app/main"

it("/health", async () => {
  const app = createExpressApp(buildTestExpressAdapter({}))

  await request(app).get("/api/v1/health").expect(200, { result: "Ok" })
})
