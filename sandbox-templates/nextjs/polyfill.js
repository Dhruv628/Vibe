// Global localStorage polyfill for SSR - runs before any other code
(function() {
  'use strict';
  
  if (typeof window === 'undefined') {
    const mockStorage = {
      getItem: function() { return null; },
      setItem: function() {},
      removeItem: function() {},
      clear: function() {},
      key: function() { return null; },
      length: 0,
    };
    
    // Polyfill for global
    if (typeof global !== 'undefined') {
      Object.defineProperty(global, 'localStorage', {
        value: mockStorage,
        writable: false,
        configurable: false,
        enumerable: true,
      });
      
      Object.defineProperty(global, 'sessionStorage', {
        value: mockStorage,
        writable: false,
        configurable: false,
        enumerable: true,
      });
    }
    
    // Polyfill for globalThis
    if (typeof globalThis !== 'undefined') {
      Object.defineProperty(globalThis, 'localStorage', {
        value: mockStorage,
        writable: false,
        configurable: false,
        enumerable: true,
      });
      
      Object.defineProperty(globalThis, 'sessionStorage', {
        value: mockStorage,
        writable: false,
        configurable: false,
        enumerable: true,
      });
    }
    
    console.log('localStorage polyfill applied for SSR environment');
  }
})();