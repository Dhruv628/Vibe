interface MockStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
  key(index: number): string | null;
  readonly length: number;
}

// Check if we're in a browser environment
if (typeof window === 'undefined') {
  // We're on the server, create localStorage polyfill
  const mockStorage: MockStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    key: () => null,
    length: 0,
  };

  // Polyfill for Node.js/server environments
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).localStorage = mockStorage;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).sessionStorage = mockStorage;
}