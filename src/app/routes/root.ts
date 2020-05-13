import { Router } from "express"
import { actionOf, Action } from "../../utils/actions"
import { simpleHandler } from "../handlers"

const health: Action<void, void, { result: string }> = () => actionOf({ result: "Ok" })

export const root = Router().get("/health", simpleHandler(health))
