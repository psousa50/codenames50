import { Router } from "express"
import { ExpressEnvironment } from "../adapters"
import { responseHandler } from "../handlers"

export const games = ({
  domainAdapter: {
    gamesDomainPorts: { create, join },
    domainEnvironment,
  },
}: ExpressEnvironment) =>
  Router()
    .post("/create", responseHandler(domainEnvironment, create))
    .post("/join", responseHandler(domainEnvironment, join))
