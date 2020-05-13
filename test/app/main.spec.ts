import request from "supertest"
import { createExpressApp } from "../../src/app/main"
import { buildTestExpressAdapter } from "../helpers"

it("/health", async () => {
  const app = createExpressApp(buildTestExpressAdapter({}))

  await request(app).get("/api/v1/health").expect(200, { result: "Ok" })
})
