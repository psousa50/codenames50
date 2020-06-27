#!/bin/bash

JOIN_URL="http://localhost:4000/join?gameId=1a977405-31c4-4a43-956f-737668635032"
GAME_URL=${JOIN_URL/join/game}

open "$GAME_URL&userId=Carla"
open "$GAME_URL&userId=Vasco"
open "$GAME_URL&userId=Guiga"
