#!/bin/bash

JOIN_URL="http://localhost:4000/join?gameId=df55bb1a-b5fb-41c9-90c6-dddf51447099"
GAME_URL=${JOIN_URL/join/game}

open "$GAME_URL&userId=Carla"
open "$GAME_URL&userId=Vasco"
open "$GAME_URL&userId=Guiga"
