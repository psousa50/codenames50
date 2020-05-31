#!/bin/bash

JOIN_URL="http://localhost:3000/join?gameId=b0e96055-12d4-435b-8195-e5c5a99cca78"
GAME_URL=${JOIN_URL/join/game}

open "$GAME_URL&userId=Carla"
open "$GAME_URL&userId=Vasco"
open "$GAME_URL&userId=Guiga"
