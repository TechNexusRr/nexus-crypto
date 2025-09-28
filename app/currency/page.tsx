'use client';

import { useState, useEffect, useCallback } from 'react';
import { CurrencyCard } from '../../components/CurrencyCard';

// Available currencies with names and symbols
const DEFAULT_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'UYU', name: 'Uruguayan Peso', symbol: '$U' },
  { code: 'VES', name: 'Venezuelan Bolívar', symbol: 'Bs.' },
  { code: 'DOP', name: 'Dominican Peso', symbol: 'RD$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' }
];

export default function CurrencyPage() {
  const [baseAmount, setBaseAmount] = useState('100');
  const [currencyAmounts, setCurrencyAmounts] = useState<Record<string, string>>({});
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [serverOnline, setServerOnline] = useState(true);
  const [favorites, setFavorites] = useState<string[]>(['USD', 'EUR', 'GBP']);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastEditedCurrency, setLastEditedCurrency] = useState<string>('USD');
  const [currencyOrder, setCurrencyOrder] = useState<string[]>(DEFAULT_CURRENCIES.map(c => c.code));
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // Format number with US locale
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  // Parse US formatted input
  const parseLocalizedNumber = (value: string): number => {
    // Remove commas (thousand separators) and parse as is
    const normalized = value.replace(/,/g, '');
    return parseFloat(normalized) || 0;
  };


  // Toggle favorite currency
  const toggleFavorite = useCallback((currencyCode: string) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(currencyCode)
        ? prev.filter(code => code !== currencyCode)
        : [...prev, currencyCode];
      return newFavorites;
    });
  }, []);

  // Get ordered currencies list
  const getOrderedCurrencies = useCallback(() => {
    const currencyMap = Object.fromEntries(DEFAULT_CURRENCIES.map(c => [c.code, c]));
    return currencyOrder.map(code => currencyMap[code]).filter(Boolean);
  }, [currencyOrder]);

  // Get displayed currencies based on filter and order
  const displayedCurrencies = showFavoritesOnly
    ? getOrderedCurrencies().filter(currency => favorites.includes(currency.code))
    : getOrderedCurrencies();

  // Get the display value for a currency (either from direct input or calculated)
  const getCurrencyValue = useCallback((currencyCode: string): string => {
    // If this currency has a direct input value, use it
    if (currencyAmounts[currencyCode] !== undefined) {
      return currencyAmounts[currencyCode];
    }

    // Otherwise calculate from USD base amount
    if (!rates || !baseAmount) return '';

    const numAmount = parseLocalizedNumber(baseAmount);
    if (isNaN(numAmount)) return '';

    if (currencyCode === 'USD') {
      return baseAmount;
    }

    const rate = rates[currencyCode];
    if (!rate) return '';

    const result = numAmount * rate;
    return formatNumber(result);
  }, [currencyAmounts, rates, baseAmount]);

  // Handle currency input change
  const handleCurrencyChange = useCallback((currencyCode: string, value: string) => {
    // Allow only numbers, comma and dots
    if (!/^[\d.,]*$/.test(value)) return;

    setLastEditedCurrency(currencyCode);

    if (currencyCode === 'USD') {
      // Update base amount directly
      setBaseAmount(value);
      // Clear all other currency amounts so they recalculate
      setCurrencyAmounts({});
    } else {
      // Update this currency's amount
      setCurrencyAmounts(prev => ({
        ...prev,
        [currencyCode]: value
      }));

      // Calculate USD equivalent and update base amount
      if (rates && value) {
        const numAmount = parseLocalizedNumber(value);
        if (!isNaN(numAmount) && numAmount > 0) {
          const rate = rates[currencyCode];
          if (rate) {
            const usdAmount = numAmount / rate;
            setBaseAmount(formatNumber(usdAmount));
          }
        }
      }

      // Clear other currency amounts so they recalculate from new USD amount
      setCurrencyAmounts(prev => {
        const newAmounts = { ...prev };
        Object.keys(newAmounts).forEach(code => {
          if (code !== currencyCode) {
            delete newAmounts[code];
          }
        });
        return newAmounts;
      });
    }
  }, [rates]);

  // Clear field when focused for easy editing
  const handleCurrencyFocus = (e: React.FocusEvent<HTMLInputElement>, currencyCode: string) => {
    setLastEditedCurrency(currencyCode);

    // Clear the field completely
    if (currencyCode === 'USD') {
      setBaseAmount('');
      setCurrencyAmounts({});
    } else {
      setCurrencyAmounts(prev => ({
        ...prev,
        [currencyCode]: ''
      }));
    }

    // Also clear the input value immediately
    e.target.value = '';
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, currencyCode: string) => {
    setDraggedItem(currencyCode);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetCurrencyCode: string) => {
    e.preventDefault();

    if (!draggedItem || draggedItem === targetCurrencyCode) {
      setDraggedItem(null);
      return;
    }

    setCurrencyOrder(prev => {
      const newOrder = [...prev];
      const draggedIndex = newOrder.indexOf(draggedItem);
      const targetIndex = newOrder.indexOf(targetCurrencyCode);

      // Remove dragged item
      newOrder.splice(draggedIndex, 1);
      // Insert at target position
      newOrder.splice(targetIndex, 0, draggedItem);

      return newOrder;
    });

    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  // Mobile-friendly move up/down functions
  const moveCurrencyUp = (currencyCode: string) => {
    setCurrencyOrder(prev => {
      const newOrder = [...prev];
      const currentIndex = newOrder.indexOf(currencyCode);

      if (currentIndex > 0) {
        // Swap with previous item
        [newOrder[currentIndex - 1], newOrder[currentIndex]] =
        [newOrder[currentIndex], newOrder[currentIndex - 1]];
      }

      return newOrder;
    });
  };

  const moveCurrencyDown = (currencyCode: string) => {
    setCurrencyOrder(prev => {
      const newOrder = [...prev];
      const currentIndex = newOrder.indexOf(currencyCode);

      if (currentIndex < newOrder.length - 1) {
        // Swap with next item
        [newOrder[currentIndex], newOrder[currentIndex + 1]] =
        [newOrder[currentIndex + 1], newOrder[currentIndex]];
      }

      return newOrder;
    });
  };

  // Save favorites and base amount to localStorage
  useEffect(() => {
    if (!isLoaded) return;

    const data = {
      favorites,
      showFavoritesOnly,
      baseAmount,
      currencyAmounts,
      lastEditedCurrency,
      currencyOrder,
    };
    localStorage.setItem('currency:preferences', JSON.stringify(data));
  }, [isLoaded, favorites, showFavoritesOnly, baseAmount, currencyAmounts, lastEditedCurrency, currencyOrder]);

  // Load preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('currency:preferences');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.favorites) setFavorites(data.favorites);
        if (data.showFavoritesOnly !== undefined) setShowFavoritesOnly(data.showFavoritesOnly);
        if (data.baseAmount !== undefined) setBaseAmount(data.baseAmount);
        if (data.currencyAmounts) setCurrencyAmounts(data.currencyAmounts);
        if (data.lastEditedCurrency) setLastEditedCurrency(data.lastEditedCurrency);
        if (data.currencyOrder) {
          const currentCodes = DEFAULT_CURRENCIES.map(c => c.code);
          const savedOrder = data.currencyOrder;
          const missingCodes = currentCodes.filter((code: string) => !savedOrder.includes(code));
          if (missingCodes.length > 0) {
            const updatedOrder = [...savedOrder, ...missingCodes];
            setCurrencyOrder(updatedOrder);
          } else {
            setCurrencyOrder(savedOrder);
          }
        }
      } catch {
        // Ignore invalid data
      }
    }
    setIsLoaded(true);
  }, []);

  // Check server connectivity
  const checkServerConnectivity = useCallback(async () => {
    try {
      // Try to fetch from the server using a lightweight endpoint
      const response = await fetch(window.location.origin + '/manifest.json', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(3000) // 3 second timeout
      });
      const isOnline = response.ok;
      setServerOnline(isOnline);
      return isOnline;
    } catch {
      setServerOnline(false);
      return false;
    }
  }, []);

  // Check if cached data is still valid based on TTL
  const isCacheValid = useCallback((lastUpdateTime: string): boolean => {
    const ttlMinutes = parseInt(process.env.NEXT_PUBLIC_RATES_API_TTL_MIN || '45', 10);
    const lastUpdate = new Date(lastUpdateTime);
    const now = new Date();
    const diffMs = now.getTime() - lastUpdate.getTime();
    const diffMinutes = diffMs / (1000 * 60);
    return diffMinutes < ttlMinutes;
  }, []);

  // Fetch rates from API or cache
  const fetchRates = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    // Check cache first if not forcing refresh
    if (!forceRefresh) {
      const storedRates = localStorage.getItem('currency:lastRates');
      const storedUpdate = localStorage.getItem('currency:lastUpdate');
      const storedBase = localStorage.getItem('currency:lastBase');
      const baseCurrency = process.env.NEXT_PUBLIC_RATES_API_BASE_CURRENCY || 'USD';

      // Use cache if valid and base currency matches
      if (storedRates && storedUpdate && storedBase === baseCurrency && isCacheValid(storedUpdate)) {
        setRates(JSON.parse(storedRates));
        setLastUpdate(new Date(storedUpdate));
        setIsOffline(false);
        setLoading(false);
        return;
      }
    }

    // First check server connectivity
    await checkServerConnectivity();

    try {
      const apiBase = process.env.NEXT_PUBLIC_RATES_API_BASE || 'https://api.exchangerate-api.com/v4';
      const apiPath = process.env.NEXT_PUBLIC_RATES_API_PATH || '/latest';
      const baseCurrency = process.env.NEXT_PUBLIC_RATES_API_BASE_CURRENCY || 'USD';

      const response = await fetch(`${apiBase}${apiPath}/${baseCurrency}`);
      if (!response.ok) throw new Error('Failed to fetch rates');

      const data = await response.json();
      setRates(data.rates);
      setLastUpdate(new Date());
      setIsOffline(false);

      // Store in localStorage with timestamp
      localStorage.setItem('currency:lastRates', JSON.stringify(data.rates));
      localStorage.setItem('currency:lastBase', baseCurrency);
      localStorage.setItem('currency:lastUpdate', new Date().toISOString());
    } catch {
      // Try to load from cache as fallback
      const storedRates = localStorage.getItem('currency:lastRates');
      const storedUpdate = localStorage.getItem('currency:lastUpdate');

      if (storedRates) {
        setRates(JSON.parse(storedRates));
        setLastUpdate(storedUpdate ? new Date(storedUpdate) : null);
        setIsOffline(true);
        setError('Using cached rates. Connect to update.');
      } else {
        setError('No cached rates. Connect at least once.');
      }
    } finally {
      setLoading(false);
    }
  }, [checkServerConnectivity, isCacheValid]);

  // Check for navigator.onLine on component mount and listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      checkServerConnectivity();
      // Only fetch fresh data if cache is expired
      fetchRates(false);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setServerOnline(false);
    };

    if (typeof window !== 'undefined') {
      // Initial load - check cache first
      fetchRates(false);

      // Periodic server connectivity check (every 30 seconds)
      const serverCheckInterval = setInterval(checkServerConnectivity, 30000);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        clearInterval(serverCheckInterval);
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [fetchRates, checkServerConnectivity]);

  // Format timestamp
  const formatTimestamp = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    });
  };

  return (
    <div
      className="container mx-auto px-4 py-8"
      role="tabpanel"
      id="currency-panel"
      aria-labelledby="currency-tab"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Currency Converter
          </h2>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Favorites toggle */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showFavoritesOnly}
                onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Favorites Only
              </span>
            </label>

            {/* Update button */}
            <button
              onClick={() => fetchRates(true)}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600
                       disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors
                       focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {loading ? 'Updating...' : 'Update Rates'}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Click any currency amount to edit. Changes will automatically update all other currencies.
          </p>
        </div>

        {/* Status indicators */}
        <div className="flex items-center gap-4 mb-6">
          {loading && (
            <span className="text-sm text-yellow-600 dark:text-yellow-400">
              Updating rates...
            </span>
          )}
          {(isOffline || !serverOnline) && !loading && (
            <span className="text-sm text-orange-600 dark:text-orange-400">
              {!serverOnline ? 'Server Offline' : 'Network Offline'}
            </span>
          )}
          {lastUpdate && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Last update: {formatTimestamp(lastUpdate)}
            </span>
          )}
        </div>

        {/* Error display */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg mb-6">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Currency grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayedCurrencies.map((currency, index) => {
            const isFavorite = favorites.includes(currency.code);
            const currencyValue = getCurrencyValue(currency.code);
            const isLastEdited = lastEditedCurrency === currency.code;
            const isDragged = draggedItem === currency.code;
            const isFirst = index === 0;
            const isLast = index === displayedCurrencies.length - 1;

            return (
              <CurrencyCard
                key={currency.code}
                currency={currency}
                value={currencyValue}
                isFavorite={isFavorite}
                isLastEdited={isLastEdited}
                isDragged={isDragged}
                isFirst={isFirst}
                isLast={isLast}
                rates={rates}
                onValueChange={handleCurrencyChange}
                onFocus={handleCurrencyFocus}
                onToggleFavorite={toggleFavorite}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                onMoveUp={moveCurrencyUp}
                onMoveDown={moveCurrencyDown}
              />
            );
          })}
        </div>

        {/* No favorites message */}
        {showFavoritesOnly && favorites.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No favorite currencies selected. Click the star (☆) on any currency to add it to favorites.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}