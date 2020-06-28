#!/bin/bash

JOIN_URL="http://localhost:4000/join?gameId=74b14330-fb63-40c2-8037-944d7312a631"
GAME_URL=${JOIN_URL/join/game}

open "$GAME_URL&userId=Carla"
open "$GAME_URL&userId=Vasco"
open "$GAME_URL&userId=Guiga"
