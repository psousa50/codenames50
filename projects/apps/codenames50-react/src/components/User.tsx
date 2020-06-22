import { makeStyles, Theme } from "@material-ui/core"
import { common } from "@material-ui/core/colors"
import Typography from "@material-ui/core/Typography"
import { Teams } from "codenames50-core/lib/models"
import React from "react"
import { teamColor } from "../utils/styles"

const useStyles = makeStyles((theme: Theme) => ({
  text: {
    userSelect: "none",
    textAlign: "center",
    padding: "2px 50px 2px 50px",
    borderRadius: "10px",
    minWidth: "100px",
  },
}))

interface UserProps {
  userId?: string
  team?: Teams
  spyMaster?: boolean
}

export const User: React.FC<UserProps> = ({ userId, team, spyMaster }) => {
  const classes = useStyles()
  const styles = {
    spyMaster: {
      backgroundColor: teamColor(team),
      color: common.white,
      border: `1px solid ${teamColor(team)}`,
    },
    notSpyMaster: {
      backgroundColor: common.white,
      color: teamColor(team),
      border: `1px solid ${teamColor(team)}`,
    },
  }

  const spyMasterStyle = spyMaster ? styles.spyMaster : styles.notSpyMaster

  return (
    <Typography variant="h4" style={spyMasterStyle} className={classes.text}>
      {userId}
    </Typography>
  )
}
