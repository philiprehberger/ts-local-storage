import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../../dist/index.js';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function createMockStorage(): Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'clear'> {
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

describe('createStore', () => {
  it('should set and get a basic value', () => {
    const store = createStore({ storage: createMockStorage() });
    store.set('name', 'Alice');
    assert.equal(store.get('name'), 'Alice');
  });

  it('should return defaultValue for missing key', () => {
    const store = createStore({ storage: createMockStorage() });
    assert.equal(store.get('missing', 'fallback'), 'fallback');
  });

  it('should return undefined for missing key without default', () => {
    const store = createStore({ storage: createMockStorage() });
    assert.equal(store.get('missing'), undefined);
  });

  it('should support TTL and expire items', async () => {
    const store = createStore({ storage: createMockStorage() });
    store.set('temp', 'value', { ttl: 50 });

    assert.equal(store.get('temp'), 'value');

    await sleep(60);

    assert.equal(store.get('temp'), undefined);
  });

  it('should return true from has() for existing key', () => {
    const store = createStore({ storage: createMockStorage() });
    store.set('key', 'val');
    assert.equal(store.has('key'), true);
  });

  it('should return false from has() for missing key', () => {
    const store = createStore({ storage: createMockStorage() });
    assert.equal(store.has('missing'), false);
  });

  it('should remove a key', () => {
    const store = createStore({ storage: createMockStorage() });
    store.set('key', 'val');
    store.remove('key');
    assert.equal(store.get('key'), undefined);
  });

  it('should clear all keys', () => {
    const store = createStore({ storage: createMockStorage() });
    store.set('a', 1);
    store.set('b', 2);
    store.clear();
    assert.equal(store.get('a'), undefined);
    assert.equal(store.get('b'), undefined);
  });

  it('should scope keys with prefix', () => {
    const mock = createMockStorage();
    const store = createStore({ storage: mock, prefix: 'app:' });

    store.set('key', 'value');

    // The underlying storage should have the prefixed key
    assert.notEqual(mock.getItem('app:key'), null);
    assert.equal(mock.getItem('key'), null);
    assert.equal(store.get('key'), 'value');
  });

  it('should return defaultValue on JSON parse error', () => {
    const mock = createMockStorage();
    mock.setItem('bad', 'not-json');

    const store = createStore({ storage: mock });
    assert.equal(store.get('bad', 'default'), 'default');
  });

  it('should handle nested objects', () => {
    const store = createStore({ storage: createMockStorage() });
    const obj = { nested: { deep: [1, 2, 3] } };
    store.set('data', obj);
    assert.deepEqual(store.get('data'), obj);
  });
});
