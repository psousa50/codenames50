#!/bin/bash

rm -rf src/codenames-core

cp -rf ../codenames-core/src src/codenames-core

rm -rf src/messaging
mkdir src/messaging/
cp -rf ../codenames-server/src/messaging/messages.ts src/messaging/messages.ts
