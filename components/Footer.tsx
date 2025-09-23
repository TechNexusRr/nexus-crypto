'use client';

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
            Made with{' '}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className="text-red-500 dark:text-red-400"
              aria-label="love"
            >
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                fill="currentColor"
              />
            </svg>
            {' '}by{' '}
            <span className="font-medium text-gray-800 dark:text-gray-200">
              TechNexusRr
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export { Footer };