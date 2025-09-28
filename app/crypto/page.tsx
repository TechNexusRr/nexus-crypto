'use client';

import { useState, useEffect, useCallback } from 'react';
import { ConfigModal } from '../../components/ConfigModal';

// Increment presets for different trading strategies
const INCREMENT_PRESETS = {
  quick: {
    name: 'Quick (5 points)',
    description: 'Fast analysis with key breakpoints',
    increments: [0.005, 0.01, 0.02, 0.03, 0.05]
  },
  standard: {
    name: 'Standard (12 points)',
    description: 'Balanced analysis for most scenarios',
    increments: [0.005, 0.01, 0.015, 0.02, 0.025, 0.03, 0.035, 0.04, 0.045, 0.05, 0.06, 0.08]
  },
  detailed: {
    name: 'Detailed (20+ points)',
    description: 'Comprehensive analysis with fine granularity',
    increments: [
      0.0010, 0.0015, 0.0020, 0.0021, 0.0023,
      0.0030, 0.0040, 0.0050, 0.0060, 0.0070,
      0.0080, 0.0090, 0.0100, 0.0110, 0.0120,
      0.0130, 0.0140, 0.0150, 0.0160, 0.0170,
      0.0180, 0.0190, 0.0200, 0.0210, 0.0220,
      0.0230, 0.0240, 0.0250, 0.0260
    ]
  },
  conservative: {
    name: 'Conservative (8 points)',
    description: 'Lower risk with smaller increments',
    increments: [0.002, 0.005, 0.008, 0.01, 0.015, 0.02, 0.025, 0.03]
  },
  aggressive: {
    name: 'Aggressive (10 points)',
    description: 'Higher risk with larger increments',
    increments: [0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.08, 0.10, 0.12, 0.15]
  }
};

interface CalculationRow {
  sellAt: number;
  breakEvenMet: boolean;
  gains: number;
  amountIncreased: number;
  percentageIncrease: number;
}

export default function CryptoPage() {
  // Track if data has been loaded from localStorage
  const [isLoaded, setIsLoaded] = useState(false);

  // Main inputs - start with empty values for first-time users
  const [purchasePrice, setPurchasePrice] = useState('0');
  const [purchaseAmount, setPurchaseAmount] = useState('0');
  const [buyFeeRate, setBuyFeeRate] = useState('0.1');
  const [sellFeeRate, setSellFeeRate] = useState('0.1');
  const [increments, setIncrements] = useState<number[]>(INCREMENT_PRESETS.standard.increments);
  const [selectedPreset, setSelectedPreset] = useState<string>('standard');
  const [customIncrement, setCustomIncrement] = useState('1.0');

  // Display precision settings
  const [sellAtDecimals, setSellAtDecimals] = useState('4');
  const [amountIncreasedDecimals, setAmountIncreasedDecimals] = useState('4');

  // Modal state
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Calculated results
  const [breakEvenPrice, setBreakEvenPrice] = useState<number>(0);
  const [calculationRows, setCalculationRows] = useState<CalculationRow[]>([]);

  // Format number with specific decimals
  const formatNumber = (num: number, decimals = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  // Format currency
  const formatCurrency = (num: number, decimals = 2) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  // Format percentage
  const formatPercentage = (num: number, decimals = 2) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  // Parse US formatted number input
  const parseLocalizedNumber = (value: string): number => {
    // Remove commas (thousand separators) and parse as is
    const normalized = value.replace(/,/g, '');
    return parseFloat(normalized) || 0;
  };

  // Handle number input validation for US format
  const handleNumberInput = (
    value: string,
    setter: (value: string) => void,
    allowNegative = false
  ) => {
    // Allow digits, dots (decimals), commas (thousands separators), and optional negative sign
    const pattern = allowNegative ? /^-?[\d.,]*$/ : /^[\d.,]*$/;
    if (pattern.test(value)) {
      setter(value);
    }
  };

  // Increment management functions
  const addCustomIncrement = () => {
    const increment = parseFloat(customIncrement) / 100; // Convert percentage to decimal
    if (!isNaN(increment) && increment >= -0.5 && increment <= 0.5 && !increments.includes(increment)) {
      const newIncrements = [...increments, increment].sort((a, b) => a - b);
      setIncrements(newIncrements);
      setSelectedPreset('custom');
      setCustomIncrement('');
    }
  };

  const removeIncrement = (increment: number) => {
    setIncrements(increments.filter(inc => inc !== increment));
    setSelectedPreset('custom');
  };

  const loadPreset = (presetKey: string) => {
    if (presetKey in INCREMENT_PRESETS) {
      setIncrements(INCREMENT_PRESETS[presetKey as keyof typeof INCREMENT_PRESETS].increments);
      setSelectedPreset(presetKey);
    }
  };

  // Smart increment generator based on price range
  const generateSmartIncrements = () => {
    const price = parseLocalizedNumber(purchasePrice);
    if (price <= 0) return;

    let smartIncrements: number[] = [];

    if (price < 100) {
      // Low price: smaller increments
      smartIncrements = [0.01, 0.02, 0.03, 0.05, 0.08, 0.10, 0.15, 0.20];
    } else if (price < 1000) {
      // Medium price: balanced increments
      smartIncrements = [0.005, 0.01, 0.015, 0.02, 0.03, 0.05, 0.08, 0.10, 0.12];
    } else if (price < 10000) {
      // High price: focus on smaller percentage gains
      smartIncrements = [0.002, 0.005, 0.008, 0.01, 0.015, 0.02, 0.03, 0.05, 0.08];
    } else {
      // Very high price: very fine increments
      smartIncrements = [0.001, 0.002, 0.003, 0.005, 0.008, 0.01, 0.015, 0.02, 0.03];
    }

    setIncrements(smartIncrements);
    setSelectedPreset('custom');
  };

  // Generate range of increments
  const generateRange = (start: number, end: number, count: number) => {
    if (start >= end || count < 2) return;

    const step = (end - start) / (count - 1);
    const rangeIncrements = Array.from({ length: count }, (_, i) => (start + i * step) / 100);

    setIncrements(rangeIncrements);
    setSelectedPreset('custom');
  };

  // Main calculation function
  const calculateResults = useCallback(() => {
    const price = parseLocalizedNumber(purchasePrice);
    const amount = parseLocalizedNumber(purchaseAmount);
    const buyFee = parseFloat(buyFeeRate) / 100;
    const sellFee = parseFloat(sellFeeRate) / 100;

    if (price <= 0 || amount <= 0) {
      setBreakEvenPrice(0);
      setCalculationRows([]);
      return;
    }

    // 1) Buy step calculations
    const buyFeeAmount = amount * buyFee;
    const netPurchaseAmount = amount - buyFeeAmount;
    const cryptoBought = netPurchaseAmount / price;

    // 2) Break-even price calculation (with fee compounding)
    const bep = price * (1 + buyFee + sellFee + buyFee * sellFee);
    setBreakEvenPrice(bep);

    // 3) Calculate rows for each increment
    const rows: CalculationRow[] = increments.map(p => {
      const sellAt = price * (1 + p);
      const grossProceeds = sellAt * cryptoBought;
      const sellFeeAmount = grossProceeds * sellFee;
      const netProceeds = grossProceeds - sellFeeAmount;
      const gains = netProceeds - amount;
      const breakEvenMet = gains > 0; // Strictly greater than zero

      return {
        sellAt,
        breakEvenMet,
        gains,
        amountIncreased: sellAt - price,
        percentageIncrease: p,
      };
    });

    setCalculationRows(rows);
  }, [purchasePrice, purchaseAmount, buyFeeRate, sellFeeRate, increments]);

  // Recalculate on input changes
  useEffect(() => {
    calculateResults();
  }, [calculateResults]);

  // Save to localStorage with debouncing (only after initial load)
  useEffect(() => {
    if (!isLoaded) return; // Don't save until we've loaded from localStorage first

    const timeoutId = setTimeout(() => {
      const data = {
        purchasePrice,
        purchaseAmount,
        buyFeeRate,
        sellFeeRate,
        increments,
        selectedPreset,
        sellAtDecimals,
        amountIncreasedDecimals,
      };
      localStorage.setItem('crypto:inputs', JSON.stringify(data));
      console.log('Saving to localStorage:', data); // Debug log
    }, 100); // Small delay to avoid too frequent saves

    return () => clearTimeout(timeoutId);
  }, [isLoaded, purchasePrice, purchaseAmount, buyFeeRate, sellFeeRate, increments, selectedPreset, sellAtDecimals, amountIncreasedDecimals]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('crypto:inputs');
    console.log('Loading from localStorage:', saved); // Debug log
    if (saved) {
      try {
        const data = JSON.parse(saved);
        console.log('Parsed data:', data); // Debug log
        if (data.purchasePrice !== undefined) {
          console.log('Setting purchasePrice:', data.purchasePrice);
          setPurchasePrice(data.purchasePrice);
        }
        if (data.purchaseAmount !== undefined) {
          console.log('Setting purchaseAmount:', data.purchaseAmount);
          setPurchaseAmount(data.purchaseAmount);
        }
        if (data.buyFeeRate !== undefined) setBuyFeeRate(data.buyFeeRate);
        if (data.sellFeeRate !== undefined) setSellFeeRate(data.sellFeeRate);
        if (data.increments !== undefined) setIncrements(data.increments);
        if (data.selectedPreset !== undefined) setSelectedPreset(data.selectedPreset);
        if (data.sellAtDecimals !== undefined) setSellAtDecimals(data.sellAtDecimals);
        if (data.amountIncreasedDecimals !== undefined) setAmountIncreasedDecimals(data.amountIncreasedDecimals);
      } catch (error) {
        console.error('Error parsing localStorage data:', error);
      }
    } else {
      console.log('No saved data found in localStorage');
    }

    // Mark as loaded whether we found data or not
    setIsLoaded(true);
    console.log('Data loading completed, isLoaded set to true');
  }, []);

  // Reset to defaults (with example values)
  const resetToDefaults = () => {
    setPurchasePrice('4485.0');
    setPurchaseAmount('23520.0');
    setBuyFeeRate('0.1');
    setSellFeeRate('0.1');
    setIncrements(INCREMENT_PRESETS.detailed.increments);
    setSelectedPreset('detailed');
    setSellAtDecimals('4');
    setAmountIncreasedDecimals('4');
  };

  // Clear all inputs
  const clearInputs = () => {
    setPurchasePrice('0');
    setPurchaseAmount('0');
    setBuyFeeRate('0.1');
    setSellFeeRate('0.1');
    setIncrements(INCREMENT_PRESETS.standard.increments);
    setSelectedPreset('standard');
    setSellAtDecimals('4');
    setAmountIncreasedDecimals('4');
  };

  // Handle config modal save
  const handleConfigSave = (config: {
    buyFeeRate: string;
    sellFeeRate: string;
    sellAtDecimals: string;
    amountIncreasedDecimals: string;
  }) => {
    setBuyFeeRate(config.buyFeeRate);
    setSellFeeRate(config.sellFeeRate);
    setSellAtDecimals(config.sellAtDecimals);
    setAmountIncreasedDecimals(config.amountIncreasedDecimals);
  };

  return (
    <div
      className="container mx-auto px-4 py-8"
      role="tabpanel"
      id="crypto-panel"
      aria-labelledby="crypto-tab"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Crypto Trading P&L Calculator
          </h2>
          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-2 sm:gap-2
                     bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600
                     focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors touch-manipulation"
            title="Configuration"
            aria-label="Open configuration settings"
          >
            <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="hidden sm:inline">Config</span>
          </button>
        </div>

        {/* Input Controls */}
        <div className="grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-2 gap-6 mb-8">
          {/* Left Column - Basic Inputs */}
          <div className="space-y-6">
            <div>
              <label
                htmlFor="purchase-price"
                className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
              >
                Purchase Price (USD)
              </label>
              <input
                id="purchase-price"
                type="text"
                inputMode="decimal"
                value={purchasePrice}
                onChange={(e) => handleNumberInput(e.target.value, setPurchasePrice)}
                onFocus={(e) => { setPurchasePrice(''); e.target.value = ''; }}
                className="w-full px-4 py-4 sm:py-2 text-lg sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
                placeholder="0"
              />
            </div>

            <div>
              <label
                htmlFor="purchase-amount"
                className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
              >
                Purchase Amount (USD)
              </label>
              <input
                id="purchase-amount"
                type="text"
                inputMode="decimal"
                value={purchaseAmount}
                onChange={(e) => handleNumberInput(e.target.value, setPurchaseAmount)}
                onFocus={(e) => { setPurchaseAmount(''); e.target.value = ''; }}
                className="w-full px-4 py-4 sm:py-2 text-lg sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
                placeholder="0"
              />
            </div>

          </div>

          {/* Middle Column - Increment Presets */}
          <div className="space-y-6">
            {/* Increment Presets */}
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                Analysis Strategy
              </label>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(INCREMENT_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => loadPreset(key)}
                    className={`p-3 text-left rounded-lg border-2 transition-all touch-manipulation ${
                      selectedPreset === key
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      {preset.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {preset.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Smart Generators */}
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                Quick Generators
              </label>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={generateSmartIncrements}
                  disabled={!purchasePrice || parseLocalizedNumber(purchasePrice) <= 0}
                  className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700
                           disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors touch-manipulation text-sm"
                  title="Generate increments optimized for your purchase price"
                >
                  🧠 Smart Generate
                </button>
                <button
                  onClick={() => generateRange(0.5, 5.0, 10)}
                  className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700
                           transition-colors touch-manipulation text-sm"
                  title="Generate 10 increments from 0.5% to 5%"
                >
                  📊 Range 0.5-5%
                </button>
              </div>
            </div>

            {/* Break-even price info */}
            {breakEvenPrice > 0 && (
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Break-even Price: {formatCurrency(breakEvenPrice, parseInt(sellAtDecimals))}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Price needed to cover both buy and sell fees
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
              <button
                onClick={resetToDefaults}
                className="w-full sm:w-auto px-6 py-4 sm:py-2 text-lg sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700
                         focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors touch-manipulation"
              >
                Load Example
              </button>
              <button
                onClick={clearInputs}
                className="w-full sm:w-auto px-6 py-4 sm:py-2 text-lg sm:text-base bg-gray-600 text-white rounded-lg hover:bg-gray-700
                         focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors touch-manipulation"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Right Column - Increment Management */}
          <div className="xl:block lg:col-span-2 xl:col-span-1 space-y-6">
            {/* Current Increments Display */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Current Increments ({increments.length} points)
                </label>
                {selectedPreset === 'custom' && (
                  <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                    Custom
                  </span>
                )}
              </div>

              <div className="max-h-40 xl:max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                <div className="flex flex-wrap gap-2">
                  {increments.map((increment, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm rounded-md"
                    >
                      {(increment * 100).toFixed(2)}%
                      <button
                        onClick={() => removeIncrement(increment)}
                        className="ml-1 text-blue-600 dark:text-blue-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Remove increment"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Add Custom Increment */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Add Custom Increment
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  value={customIncrement}
                  onChange={(e) => handleNumberInput(e.target.value, setCustomIncrement, true)}
                  onFocus={(e) => { setCustomIncrement(''); e.target.value = ''; }}
                  className="flex-1 px-4 py-4 sm:py-2 text-lg sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
                  placeholder="e.g., 1.5 or -2.5"
                />
                <span className="flex items-center px-3 text-gray-500 dark:text-gray-400">%</span>
                <button
                  onClick={addCustomIncrement}
                  disabled={!customIncrement || isNaN(parseFloat(customIncrement))}
                  className="px-4 py-4 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700
                           disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors touch-manipulation"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results - Mobile Cards (sm and below) */}
        {calculationRows.length > 0 && (
          <div className="block md:hidden space-y-3">
            {calculationRows.map((row, index) => {
              const isBreakEvenRow = row.sellAt >= breakEvenPrice;
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isBreakEvenRow
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  }`}
                >
                  {/* Header with sell price and break even status */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-lg font-bold font-mono text-gray-900 dark:text-gray-100">
                        {formatCurrency(row.sellAt, parseInt(sellAtDecimals))}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Sell At Price
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      row.breakEvenMet
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {row.breakEvenMet ? '✅ Profit' : '❌ Loss'}
                    </span>
                  </div>

                  {/* Key metrics grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className={`text-lg font-bold font-mono ${
                        row.gains > 0
                          ? 'text-green-600 dark:text-green-400'
                          : row.gains < 0
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {formatCurrency(row.gains, 2)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Gains
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-bold font-mono text-gray-900 dark:text-gray-100">
                        {formatPercentage(row.percentageIncrease, 2)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        % Increase
                      </div>
                    </div>
                  </div>

                  {/* Amount increased (less prominent) */}
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Amount Increased:</span>{' '}
                      <span className="font-mono">{formatNumber(row.amountIncreased, parseInt(amountIncreasedDecimals))}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Results Table - Desktop (md and above) */}
        {calculationRows.length > 0 && (
          <div className="hidden md:block overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Sell At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Break Even Met
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Gains
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount Increased
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Percentage Increase
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {calculationRows.map((row, index) => {
                      const isBreakEvenRow = row.sellAt >= breakEvenPrice;
                      return (
                        <tr
                          key={index}
                          className={`${
                            isBreakEvenRow
                              ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-gray-100">
                            {formatCurrency(row.sellAt, parseInt(sellAtDecimals))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              row.breakEvenMet
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                              {row.breakEvenMet ? '✅ YES' : '❌ NO'}
                            </span>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-mono ${
                            row.gains > 0
                              ? 'text-green-600 dark:text-green-400'
                              : row.gains < 0
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {formatCurrency(row.gains, 2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-gray-100">
                            {formatNumber(row.amountIncreased, parseInt(amountIncreasedDecimals))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-gray-100">
                            {formatPercentage(row.percentageIncrease, 2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* No data message */}
        {calculationRows.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              Enter purchase price and amount to see profit/loss calculations
            </p>
          </div>
        )}
      </div>

      {/* Configuration Modal */}
      <ConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        buyFeeRate={buyFeeRate}
        sellFeeRate={sellFeeRate}
        sellAtDecimals={sellAtDecimals}
        amountIncreasedDecimals={amountIncreasedDecimals}
        onSave={handleConfigSave}
      />
    </div>
  );
}

