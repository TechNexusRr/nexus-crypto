'use client';

import { useState } from 'react';
import Image from 'next/image';

interface WindowWithSW extends Window {
  clearSWCache?: () => Promise<void>;
}

const Header = () => {
  const [clearing, setClearing] = useState(false);

  const handleClearCache = async () => {
    setClearing(true);
    try {
      const windowWithSW = window as unknown as WindowWithSW;
      if ('clearSWCache' in window && typeof windowWithSW.clearSWCache === 'function') {
        await windowWithSW.clearSWCache();
      } else {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
      setClearing(false);
    }
  };

  return (
    <header className="w-full border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt="Nexus Crypto Logo"
              width={32}
              height={32}
              className="w-8 h-8"
              priority
            />
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Nexus Crypto
            </h1>
          </div>
          <button
            onClick={handleClearCache}
            disabled={clearing}
            className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700
                     disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors
                     focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            title="Clear app cache and reload"
          >
            {clearing ? 'Clearing...' : '🔄 Clear Cache'}
          </button>
        </div>
      </div>
    </header>
  );
};

export { Header };