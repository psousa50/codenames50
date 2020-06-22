#!/bin/bash

JOIN_URL="http://localhost:4000/join?gameId=46400fae-b73e-4111-8f98-eff3f12193b4"
GAME_URL=${JOIN_URL/join/game}

open "$GAME_URL&userId=Carla"
open "$GAME_URL&userId=Vasco"
open "$GAME_URL&userId=Guiga"
