import request from "supertest"
import { expressApp } from "../../../../src/app/main"

it("health", async () => {
  const res = await request(expressApp({} as any))
    .get("/api/v1/health")
    .expect(200, { result: "Ok" })

})
