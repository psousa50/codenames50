#!/bin/bash

rm -f src/api/sockets/messagesTypes.ts
rm -f src/api/models.ts

cp ../codenames-server/src/app/sockets/messagesTypes.ts src/api/sockets/messagesTypes.ts
cp ../codenames-server/src/domain/models.ts src/api/models.ts

chmod 0444 src/api/sockets/messagesTypes.ts
chmod 0444 src/api/models.ts
