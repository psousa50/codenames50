import { makeStyles, Theme } from "@material-ui/core"
import { common } from "@material-ui/core/colors"
import React from "react"
import { Teams } from "../codenames-core/models"
import { teamColor } from "../utils/styles"

const useStyles = makeStyles((theme: Theme) => ({
  text: {
    [theme.breakpoints.down(300)]: {
      fontSize: "12px",
    },
    [theme.breakpoints.between(300, 600)]: {
      fontSize: "16px",
    },
    [theme.breakpoints.up("sm")]: {
      fontSize: "26px",
    },
    [theme.breakpoints.up("md")]: {
      fontSize: "32px",
    },
    textAlign: "center",
    padding: "2px 50px 2px 50px",
    borderRadius: "10px",
    minWidth: "100px",
  },
}))

interface UserViewProps {
  userId?: string
  team?: Teams
  spyMaster?: boolean
}

export const UserView: React.FC<UserViewProps> = ({ userId, team, spyMaster }) => {
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
    <div style={spyMasterStyle} className={classes.text}>
      {userId}
    </div>
  )
}
