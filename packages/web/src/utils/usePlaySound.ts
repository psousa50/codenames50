import React from "react"
import { EnvironmentContext } from "../environment"
import successSound from "../assets/sounds/success.mp3"
import failureSound from "../assets/sounds/failure.mp3"
import hintAlertSound from "../assets/sounds/hintAlert.mp3"
import assassinSound from "../assets/sounds/assassin.mp3"
import endGameSound from "../assets/sounds/endGame.mp3"
import tickSound from "../assets/sounds/tick.mp3"
import timeoutSound from "../assets/sounds/timeout.mp3"

export const sounds = {
  success: successSound,
  failure: failureSound,
  hintAlert: hintAlertSound,
  assassin: assassinSound,
  endGame: endGameSound,
  tick: tickSound,
  timeout: timeoutSound,
}

export const usePlaySound = (url: string) => {
  const {
    config: { soundOn },
    useSound,
  } = React.useContext(EnvironmentContext)
  const [playSound] = useSound(url)
  const [playIt, setPlayIt] = React.useState(false)

  const play = () => {
    setPlayIt(true)
  }

  React.useEffect(() => {
    if (soundOn && playIt) {
      playSound()
    }
    setPlayIt(false)
  }, [playIt, playSound, soundOn])

  return play
}
