export interface StoreOptions {
  storage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'clear'>;
  prefix?: string;
}

export interface SetOptions {
  ttl?: number;
}

export interface Store {
  get<T>(key: string, defaultValue?: T): T | undefined;
  set(key: string, value: unknown, options?: SetOptions): void;
  remove(key: string): void;
  has(key: string): boolean;
  clear(): void;
}
