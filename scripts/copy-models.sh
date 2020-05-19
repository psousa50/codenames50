#!/bin/bash

rm -rf src/api/server
mkdir src/api/server

cp -rf ../codenames-server/src/ src/api/server

rm -rf src/api/server/app
rm -rf src/api/server/sockets
rm -rf src/api/server/mongodb
rm -rf src/api/server/repositories
rm -f src/api/server/*.ts

rm -f src/api/server/domain/adapters.ts
rm -f src/api/server/domain/main.ts
rm -f src/api/server/messaging/adapters.ts
rm -f src/api/server/messaging/main.ts
rm -f src/api/server/messaging/messenger.ts

rm -f src/api/server/utils/String.ts
