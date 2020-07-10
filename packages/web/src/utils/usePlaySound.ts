import React from "react"
import { EnvironmentContext } from "../environment"

export const sounds = {
  success: require("../assets/sounds/success.mp3"),
  failure: require("../assets/sounds/failure.mp3"),
  hintAlert: require("../assets/sounds/hintAlert.mp3"),
  assassin: require("../assets/sounds/assassin.mp3"),
  endGame: require("../assets/sounds/endGame.mp3"),
  tick: require("../assets/sounds/tick.mp3"),
  timeout: require("../assets/sounds/timeout.mp3"),
}

export const usePlaySound = (url: string) => {
  const { config, useSound } = React.useContext(EnvironmentContext)
  const [playSound] = useSound(url)
  const [playIt, setPlayIt] = React.useState(false)

  const play = () => {
    setPlayIt(true)
  }

  React.useEffect(() => {
    if (config.soundOn && playIt) {
      playSound()
    }
    setPlayIt(false)
  }, [playSound, playIt, config.soundOn])

  return [play]
}
