import { Router } from "express"
import { Adapter } from "../../utils/adapters"
import { responseHandler } from "../handlers"
import { fromEither } from "fp-ts/lib/TaskEither"
import { right } from "fp-ts/lib/Either"

const health: Adapter<void, { result: string }> = () => fromEither(right({ result: "Ok" }))

export const root = Router().get("/health", responseHandler(health))
