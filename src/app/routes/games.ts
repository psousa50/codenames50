import { Router } from "express"
import { Environment } from "../../environment"
import * as Games from "../../domain/games"
import { handler } from "../handlers"
import { Stringify } from "./transformers"

const createRequestTransformer = (params: Stringify<Games.CreateRequest>): Games.CreateRequest => ({
  userId: params.userId!,
})

const joinRequestTransformer = (params: Stringify<Games.JoinRequest>): Games.JoinRequest => ({
  gameId: params.gameId!,
  userId: params.userId!,
})

export const games = (env: Environment) =>
  Router()
    .post("/create", handler(env, Games.create, createRequestTransformer))
    .post("/join", handler(env, Games.join, joinRequestTransformer))
