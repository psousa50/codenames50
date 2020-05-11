import { Router } from "express"
import { Environment } from "../../environment"
import * as Games from "../../domain/games"
import * as GamesModels from "../../domain/models"
import { handler } from "../handlers"
import { Stringify } from "./transformers"

const createRequestTransformer = (params: Stringify<GamesModels.CreateInput>): GamesModels.CreateInput => ({
  language: params.language!,
  userId: params.userId!,
})

const joinRequestTransformer = (params: Stringify<GamesModels.JoinInput>): GamesModels.JoinInput => ({
  gameId: params.gameId!,
  userId: params.userId!,
})

export const games = (env: Environment) =>
  Router()
    .post("/create", handler(env, Games.create, createRequestTransformer))
    .post("/join", handler(env, Games.join, joinRequestTransformer))
