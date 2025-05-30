# Logging System

This server uses **Winston** for structured logging instead of `console.log` statements.

## Log Levels

- **error**: Application errors, exceptions
- **warn**: Warning conditions
- **info**: General application flow, startup/shutdown
- **debug**: Detailed information for debugging

## Usage

Import the logger from `utils/logger`:

```typescript
import { log } from '../utils/logger'

// Different log levels
log.error('Database connection failed', { error: err, connectionString: 'mongodb://...' })
log.warn('Rate limit approaching', { currentRequests: 95, limit: 100 })
log.info('Server started', { port: 3000, environment: 'production' })
log.debug('Socket message received', { type: 'createGame', socketId: 'abc123' })
```

## Configuration

### Environment Variables

- `LOG_LEVEL`: Set the minimum log level (default: 'info')
  - Values: 'error', 'warn', 'info', 'debug'
- `NODE_ENV`: When set to 'production', enables file logging

### Development
- Logs to console with colors and timestamps
- Format: `2024-01-15 10:30:45 [info]: Server started { port: 3000 }`

### Production
- Logs to console (for cloud platforms like Render)
- Logs to files:
  - `logs/error.log`: Only error messages
  - `logs/combined.log`: All log messages
- JSON format for easier parsing

## Migration from console.log

All `console.log` statements have been replaced with appropriate log levels:

- `console.log` → `log.info` or `log.debug`
- `console.error` → `log.error`
- Debug/development messages → `log.debug`
- Application flow → `log.info`

## Structured Logging

Instead of string interpolation, use the metadata parameter:

```typescript
// ❌ Don't do this
log.info(`User ${userId} created game ${gameId}`)

// ✅ Do this
log.info('User created game', { userId, gameId })
```

This makes logs searchable and easier to parse by log aggregation tools. 