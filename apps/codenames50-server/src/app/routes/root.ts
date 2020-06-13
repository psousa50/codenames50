import { Router } from "express"
import { right } from "fp-ts/lib/Either"
import { fromEither } from "fp-ts/lib/ReaderTaskEither"
import { Port } from "../../utils/adapters"
import { responseHandler } from "../handlers"

const health: Port<void, void, { result: string }> = () => fromEither(right({ result: "Ok" }))

export const root = Router().get("/health", responseHandler(undefined, health))
