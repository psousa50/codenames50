#!/bin/bash

JOIN_URL="http://localhost:3000/game?gameId=2386a2a2-463b-4978-a508-9b804a5e7f71"
GAME_URL=${JOIN_URL/join/game}

open "$GAME_URL&userId=Carla"
open "$GAME_URL&userId=Vasco"
open "$GAME_URL&userId=Guiga"
