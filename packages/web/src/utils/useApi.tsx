import { GameModels } from "@codenames50/core"
import { pipe } from "fp-ts/lib/pipeable"
import { task } from "fp-ts/lib/Task"
import { getOrElse } from "fp-ts/lib/TaskEither"
import React from "react"
import { EnvironmentContext } from "../environment"

export const useApi = () => {
  const { api } = React.useContext(EnvironmentContext)
  const [languages, setLanguages] = React.useState<string[]>()
  const [turnTimeouts, setTurnTimeouts] = React.useState<GameModels.TurnTimeoutConfig[]>()

  React.useEffect(() => {
    const fetch = async () => {
      const apiLanguages = await pipe(
        api.getLanguages(),
        getOrElse<Error, string[] | undefined>(_ => task.of(undefined)),
      )()

      setLanguages(apiLanguages)
    }

    fetch()
  }, [api])

  React.useEffect(() => {
    const fetch = async () => {
      const apiTurnTimeouts = await pipe(
        api.getTurnTimeouts(),
        getOrElse<Error, GameModels.TurnTimeoutConfig[] | undefined>(_ => task.of(undefined)),
      )()

      setTurnTimeouts(apiTurnTimeouts)
    }

    fetch()
  }, [api])

  return { languages, turnTimeouts }
}
