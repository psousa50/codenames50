import { Router } from "express"
import { ExpressEnvironment } from "../adapters"
import { responseHandler } from "../handlers"

export const games = ({
  domainAdapter: {
    gamesDomainPorts: { create, join, getLanguages, getTimeouts },
    domainEnvironment,
  },
}: ExpressEnvironment) =>
  Router()
    .get("/languages", responseHandler(domainEnvironment, getLanguages))
    .get("/timeouts", responseHandler(domainEnvironment, getTimeouts))
    .post("/create", responseHandler(domainEnvironment, create))
    .post("/join", responseHandler(domainEnvironment, join))
