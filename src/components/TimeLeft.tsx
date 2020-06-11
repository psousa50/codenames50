import { Typography } from "@material-ui/core"
import moment from "moment"
import React from "react"
import { sounds, usePlaySound } from "../utils/usePlaySounds"

interface TimeLeftProps {
  started: number
  responseTimeoutSec: number
  onTimeout: () => void
}

export const TimeLeft: React.FC<TimeLeftProps> = ({ started, responseTimeoutSec, onTimeout }) => {
  const [remaining, setRemaining] = React.useState(responseTimeoutSec)
  const [timedOut, setTimedOut] = React.useState(false)
  const [playTickSound] = usePlaySound(sounds.tick)
  const [playTimeoutSound] = usePlaySound(sounds.timeout)

  React.useEffect(() => {
    setTimedOut(false)
  }, [started])

  React.useEffect(() => {
    const timer = setInterval(() => {
      const timeLeftMs = Math.max(0, responseTimeoutSec * 1000 - (Date.now() - started))
      if (!timedOut) {
        if (timeLeftMs < 5 * 1000) {
          playTickSound()
        }
        if (timeLeftMs === 0) {
          playTimeoutSound()
          setTimedOut(true)
          onTimeout()
        }
      }
      setRemaining(timeLeftMs)
    }, 1000)

    return () => clearInterval(timer)
  })

  return (
    <Typography variant="h5">
      {started > 0 ? moment(moment.duration(remaining).asMilliseconds()).format("mm:ss") : "--:--"}
    </Typography>
  )
}
