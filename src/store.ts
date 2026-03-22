import type { SetOptions, Store, StoreOptions } from './types';

function createMemoryStorage(): Pick<
  Storage,
  'getItem' | 'setItem' | 'removeItem' | 'clear'
> {
  const map = new Map<string, string>();
  return {
    getItem(key: string): string | null {
      return map.get(key) ?? null;
    },
    setItem(key: string, value: string): void {
      map.set(key, value);
    },
    removeItem(key: string): void {
      map.delete(key);
    },
    clear(): void {
      map.clear();
    },
  };
}

function getDefaultStorage(): Pick<
  Storage,
  'getItem' | 'setItem' | 'removeItem' | 'clear'
> {
  try {
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
      return globalThis.localStorage;
    }
  } catch {
    // localStorage not available (SSR, restricted context)
  }
  return createMemoryStorage();
}

export function createStore(options: StoreOptions = {}): Store {
  const storage = options.storage ?? getDefaultStorage();
  const prefix = options.prefix ?? '';

  function prefixedKey(key: string): string {
    return prefix + key;
  }

  return {
    get<T>(key: string, defaultValue?: T): T | undefined {
      try {
        const raw = storage.getItem(prefixedKey(key));
        if (raw === null) {
          return defaultValue;
        }

        const parsed = JSON.parse(raw) as {
          value: T;
          expires: number | null;
        };

        if (parsed.expires !== null && Date.now() > parsed.expires) {
          storage.removeItem(prefixedKey(key));
          return defaultValue;
        }

        return parsed.value;
      } catch {
        return defaultValue;
      }
    },

    set(key: string, value: unknown, setOptions: SetOptions = {}): void {
      const entry = {
        value,
        expires: setOptions.ttl ? Date.now() + setOptions.ttl : null,
      };
      storage.setItem(prefixedKey(key), JSON.stringify(entry));
    },

    remove(key: string): void {
      storage.removeItem(prefixedKey(key));
    },

    has(key: string): boolean {
      return this.get(key) !== undefined;
    },

    clear(): void {
      if (!prefix) {
        storage.clear();
        return;
      }

      // When using a prefix, we need to find and remove matching keys
      // Since the Storage interface doesn't expose key enumeration,
      // we track keys ourselves for prefixed stores
      const keysToRemove: string[] = [];

      // Try to enumerate keys if the storage supports it
      const fullStorage = storage as Storage;
      if (typeof fullStorage.length === 'number' && typeof fullStorage.key === 'function') {
        for (let i = fullStorage.length - 1; i >= 0; i--) {
          const k = fullStorage.key(i);
          if (k !== null && k.startsWith(prefix)) {
            keysToRemove.push(k);
          }
        }
        for (const k of keysToRemove) {
          storage.removeItem(k);
        }
      } else {
        // For non-standard storage implementations, fall back to clear()
        storage.clear();
      }
    },
  };
}
