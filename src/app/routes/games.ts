import { Router } from "express"
import { responseHandler } from "../handlers"
import { ExpressEnvironment } from "../adapters"

export const games = ({
  adapters: {
    gamesDomain: { create, join },
  },
}: ExpressEnvironment) => Router().post("/create", responseHandler(create)).post("/join", responseHandler(join))
