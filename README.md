# @philiprehberger/local-storage

[![CI](https://github.com/philiprehberger/ts-local-storage/actions/workflows/ci.yml/badge.svg)](https://github.com/philiprehberger/ts-local-storage/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@philiprehberger/local-storage)](https://www.npmjs.com/package/@philiprehberger/local-storage)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Type-safe localStorage wrapper with JSON serialization, TTL, and key prefixing.

## Installation

```bash
npm install @philiprehberger/local-storage
```

## Usage

```ts
import { createStore } from '@philiprehberger/local-storage';

const store = createStore({ prefix: 'app:' });

store.set('user', { name: 'Alice', role: 'admin' });
const user = store.get<{ name: string; role: string }>('user');
console.log(user?.name); // 'Alice'
```

### TTL (Time-to-Live)

```ts
import { createStore } from '@philiprehberger/local-storage';

const store = createStore();

// Value expires after 5 minutes
store.set('session', { token: 'abc' }, { ttl: 5 * 60 * 1000 });

// Returns the value if not expired, undefined otherwise
const session = store.get('session');
```

### Default Values

```ts
import { createStore } from '@philiprehberger/local-storage';

const store = createStore();
const theme = store.get('theme', 'light'); // 'light' if not set
```

### Custom Storage Backend

```ts
import { createStore } from '@philiprehberger/local-storage';

// Use sessionStorage, or any object with getItem/setItem/removeItem/clear
const store = createStore({ storage: sessionStorage });
```

## API

| Function / Method | Description |
|-------------------|-------------|
| `createStore(options?)` | Create a new store instance |
| `store.get<T>(key, defaultValue?)` | Get a value by key; returns default if missing or expired |
| `store.set(key, value, options?)` | Set a value with optional TTL |
| `store.has(key)` | Check if a key exists and is not expired |
| `store.remove(key)` | Remove a key |
| `store.clear()` | Remove all keys (respects prefix scope) |

### StoreOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `storage` | `Storage`-like | `localStorage` | Storage backend (falls back to in-memory) |
| `prefix` | `string` | `''` | Key prefix for namespace scoping |

### SetOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `ttl` | `number` | `undefined` | Time-to-live in milliseconds |

## Development

```bash
npm install
npm run build
npm test
npm run typecheck
```

## License

MIT
