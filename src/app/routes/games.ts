import { Router } from "express"
import { Environment } from "../../environment"
import * as Games from "../../domain/games"
import { handler } from "../handlers"
import { Stringify } from "./transformers"

const createRequestTransformer = (params: Stringify<Games.CreateRequest>): Games.CreateRequest => ({
  userId: params.userId!,
})

export const games = (env: Environment) => Router().post("/", handler(env, Games.create, createRequestTransformer))
