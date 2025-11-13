// This must be imported before any other imports to ensure localStorage is available

interface MockStorage extends Storage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
  key(index: number): string | null;
  readonly length: number;
}

(() => {
  if (typeof window === 'undefined') {
    // More comprehensive polyfill for server-side environments
    const mockStorage: MockStorage = {
      getItem: (): string | null => null,
      setItem: (): void => {},
      removeItem: (): void => {},
      clear: (): void => {},
      key: (): string | null => null,
      length: 0,
    };

    // Polyfill multiple global contexts using Object.defineProperty to avoid type issues
    if (typeof global !== 'undefined') {
      Object.defineProperty(global, 'localStorage', {
        value: mockStorage,
        writable: false,
        configurable: false,
      });
      
      Object.defineProperty(global, 'sessionStorage', {
        value: mockStorage,
        writable: false,
        configurable: false,
      });
    }
    
    if (typeof globalThis !== 'undefined') {
      Object.defineProperty(globalThis, 'localStorage', {
        value: mockStorage,
        writable: false,
        configurable: false,
      });
      
      Object.defineProperty(globalThis, 'sessionStorage', {
        value: mockStorage,
        writable: false,
        configurable: false,
      });
    }

    // For Node.js environments, also patch process.browser-like checks
    if (typeof process !== 'undefined' && !process.browser) {
      // Ensure the polyfill persists even if other libraries try to override
      Object.defineProperty(global, 'localStorage', {
        value: mockStorage,
        writable: false,
        configurable: false,
      });
    }
  }
})();

export {};