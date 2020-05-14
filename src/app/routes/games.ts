import { Router } from "express"
import * as GamesModels from "../../domain/models"
import { handler } from "../handlers"
import { Stringify } from "./transformers"
import { ExpressAdapter } from "../adapters"

const createRequestTransformer = (params: Stringify<GamesModels.CreateGameInput>): GamesModels.CreateGameInput => ({
  language: params.language!,
  userId: params.userId!,
})

const joinRequestTransformer = (params: Stringify<GamesModels.JoinGameInput>): GamesModels.JoinGameInput => ({
  gameId: params.gameId!,
  userId: params.userId!,
})

export const games = ({ adapters: { domain, gamesDomain } }: ExpressAdapter) =>
  Router()
    .post("/create", handler(domain, gamesDomain.create, createRequestTransformer))
    .post("/join", handler(domain, gamesDomain.join, joinRequestTransformer))
