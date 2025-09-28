'use client';

import { useState, useEffect, useCallback } from 'react';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  buyFeeRate: string;
  sellFeeRate: string;
  sellAtDecimals: string;
  amountIncreasedDecimals: string;
  onSave: (config: {
    buyFeeRate: string;
    sellFeeRate: string;
    sellAtDecimals: string;
    amountIncreasedDecimals: string;
  }) => void;
}

const ConfigModal = ({
  isOpen,
  onClose,
  buyFeeRate,
  sellFeeRate,
  sellAtDecimals,
  amountIncreasedDecimals,
  onSave,
}: ConfigModalProps) => {
  const [localBuyFeeRate, setLocalBuyFeeRate] = useState(buyFeeRate);
  const [localSellFeeRate, setLocalSellFeeRate] = useState(sellFeeRate);
  const [localSellAtDecimals, setLocalSellAtDecimals] = useState(sellAtDecimals);
  const [localAmountIncreasedDecimals, setLocalAmountIncreasedDecimals] = useState(amountIncreasedDecimals);

  // Update local state when props change
  useEffect(() => {
    setLocalBuyFeeRate(buyFeeRate);
    setLocalSellFeeRate(sellFeeRate);
    setLocalSellAtDecimals(sellAtDecimals);
    setLocalAmountIncreasedDecimals(amountIncreasedDecimals);
  }, [buyFeeRate, sellFeeRate, sellAtDecimals, amountIncreasedDecimals]);

  // Handle number input validation
  const handleNumberInput = (value: string, setter: (value: string) => void) => {
    if (/^[\d.]*$/.test(value)) {
      setter(value);
    }
  };

  const handleSave = () => {
    onSave({
      buyFeeRate: localBuyFeeRate,
      sellFeeRate: localSellFeeRate,
      sellAtDecimals: localSellAtDecimals,
      amountIncreasedDecimals: localAmountIncreasedDecimals,
    });
    onClose();
  };

  const handleCancel = useCallback(() => {
    // Reset to original values
    setLocalBuyFeeRate(buyFeeRate);
    setLocalSellFeeRate(sellFeeRate);
    setLocalSellAtDecimals(sellAtDecimals);
    setLocalAmountIncreasedDecimals(amountIncreasedDecimals);
    onClose();
  }, [buyFeeRate, sellFeeRate, sellAtDecimals, amountIncreasedDecimals, onClose]);

  const resetToDefaults = () => {
    setLocalBuyFeeRate('0.1');
    setLocalSellFeeRate('0.1');
    setLocalSellAtDecimals('4');
    setLocalAmountIncreasedDecimals('4');
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Prevent background scrolling - mobile optimized
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, [isOpen, handleCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Configuration
          </h3>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Current Settings Summary */}
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-3">
              Current Settings
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-blue-700 dark:text-blue-300">
                <span className="font-medium">Buy Fee:</span> {buyFeeRate}%
              </div>
              <div className="text-blue-700 dark:text-blue-300">
                <span className="font-medium">Sell Fee:</span> {sellFeeRate}%
              </div>
              <div className="text-blue-700 dark:text-blue-300">
                <span className="font-medium">Sell At Decimals:</span> {sellAtDecimals}
              </div>
              <div className="text-blue-700 dark:text-blue-300">
                <span className="font-medium">Amount Decimals:</span> {amountIncreasedDecimals}
              </div>
            </div>
          </div>

          {/* Trading Fees */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
              Trading Fees
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="modal-buy-fee"
                  className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                >
                  Buy Fee (%)
                </label>
                <input
                  id="modal-buy-fee"
                  type="text"
                  inputMode="decimal"
                  value={localBuyFeeRate}
                  onChange={(e) => handleNumberInput(e.target.value, setLocalBuyFeeRate)}
                  onFocus={(e) => { setLocalBuyFeeRate(''); e.target.value = ''; }}
                  className="w-full px-4 py-4 sm:py-2 text-lg sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
                  placeholder="0.1"
                />
              </div>

              <div>
                <label
                  htmlFor="modal-sell-fee"
                  className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                >
                  Sell Fee (%)
                </label>
                <input
                  id="modal-sell-fee"
                  type="text"
                  inputMode="decimal"
                  value={localSellFeeRate}
                  onChange={(e) => handleNumberInput(e.target.value, setLocalSellFeeRate)}
                  onFocus={(e) => { setLocalSellFeeRate(''); e.target.value = ''; }}
                  className="w-full px-4 py-4 sm:py-2 text-lg sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
                  placeholder="0.1"
                />
              </div>
            </div>
          </div>

          {/* Display Precision */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
              Display Precision
            </h4>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="modal-sell-at-decimals"
                  className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                >
                  Sell At (decimals)
                </label>
                <select
                  id="modal-sell-at-decimals"
                  value={localSellAtDecimals}
                  onChange={(e) => setLocalSellAtDecimals(e.target.value)}
                  className="w-full px-4 py-4 sm:py-2 text-lg sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num.toString()}>{num}</option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="modal-amount-increased-decimals"
                  className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                >
                  Amount Increased (decimals)
                </label>
                <select
                  id="modal-amount-increased-decimals"
                  value={localAmountIncreasedDecimals}
                  onChange={(e) => setLocalAmountIncreasedDecimals(e.target.value)}
                  className="w-full px-4 py-4 sm:py-2 text-lg sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num.toString()}>{num}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Reset button */}
          <div className="pt-2">
            <button
              onClick={resetToDefaults}
              className="w-full px-6 py-4 sm:py-2 text-lg sm:text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300
                       rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors touch-manipulation"
            >
              Reset to Defaults
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleCancel}
            className="w-full sm:w-auto px-6 py-4 sm:py-2 text-lg sm:text-sm font-medium text-gray-700 dark:text-gray-300
                     bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600
                     transition-colors touch-manipulation"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="w-full sm:w-auto px-6 py-4 sm:py-2 text-lg sm:text-sm font-medium text-white bg-blue-600 rounded-lg
                     hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                     transition-colors touch-manipulation"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export { ConfigModal };