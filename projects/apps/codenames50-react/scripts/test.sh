#!/bin/bash

JOIN_URL="https://codenames50.netlify.app/join?gameId=75cbd7b0-565c-4bb1-a214-f10982b8015c"
GAME_URL=${JOIN_URL/join/game}

open "$GAME_URL&userId=Carla"
open "$GAME_URL&userId=Vasco"
open "$GAME_URL&userId=Guiga"
