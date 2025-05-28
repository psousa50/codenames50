import { Router } from "express"
import { ExpressEnvironment } from "../adapters"
import { responseHandler } from "../handlers"

export const games = ({
  domainAdapter: {
    gamesDomainPorts: { create, join, getLanguages, getTurnTimeouts, getVariants },
    domainEnvironment,
  },
}: ExpressEnvironment) =>
  Router()
    .get("/languages", responseHandler(domainEnvironment, getLanguages))
    .get("/turnTimeouts", responseHandler(domainEnvironment, getTurnTimeouts))
    .get("/variants", responseHandler(domainEnvironment, getVariants))
    .post("/create", responseHandler(domainEnvironment, create))
    .post("/join", responseHandler(domainEnvironment, join))
