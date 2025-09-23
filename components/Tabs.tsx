'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Tabs = () => {
  const pathname = usePathname();

  const tabs = [
    { name: 'Currency', href: '/currency', id: 'currency' },
    { name: 'Crypto P&L', href: '/crypto', id: 'crypto' },
  ];

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav
        className="container mx-auto px-4 -mb-px flex space-x-8"
        role="tablist"
        aria-label="Main navigation"
      >
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              role="tab"
              aria-selected={isActive}
              aria-controls={`${tab.id}-panel`}
              id={`${tab.id}-tab`}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                transition-colors duration-200
                ${isActive
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900
              `}
            >
              {tab.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export { Tabs };