import { Typography } from "@mui/material"
import React from "react"

export interface TimeLeftProps {
  timeLeft: number
}

export const TimeLeft: React.FC<TimeLeftProps> = ({ timeLeft }) => {
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = time % 60
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <Typography variant="h6" color={timeLeft < 30 ? "error" : "textPrimary"}>
      {formatTime(timeLeft)}
    </Typography>
  )
}
