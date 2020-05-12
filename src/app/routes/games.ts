import { Router } from "express"
import { Environment } from "../../environment"
import * as GamesModels from "../../domain/models"
import { handler } from "../handlers"
import { Stringify } from "./transformers"

const createRequestTransformer = (params: Stringify<GamesModels.CreateGameInput>): GamesModels.CreateGameInput => ({
  language: params.language!,
  userId: params.userId!,
})

const joinRequestTransformer = (params: Stringify<GamesModels.JoinGameInput>): GamesModels.JoinGameInput => ({
  gameId: params.gameId!,
  userId: params.userId!,
})

export const games = (env: Environment) =>
  Router()
    .post("/create", handler(env, env.gamesDomain.create, createRequestTransformer))
    .post("/join", handler(env, env.gamesDomain.join, joinRequestTransformer))
