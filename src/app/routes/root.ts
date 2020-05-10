import { Router } from "express"
import { Environment } from "../../environment"
import { actionOf, Action } from "../../utils/actions"
import { noRequestHandler } from "../handlers"

const health: Action<void, { result: string }> = () => actionOf({ result: "Ok" })

export const root = (env: Environment) => Router().get("/health", noRequestHandler(env, health))
