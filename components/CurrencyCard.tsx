'use client';

import { useCallback } from 'react';

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

interface CurrencyCardProps {
  currency: Currency;
  value: string;
  isFavorite: boolean;
  isLastEdited: boolean;
  isDragged: boolean;
  isFirst: boolean;
  isLast: boolean;
  rates: Record<string, number> | null;
  onValueChange: (currencyCode: string, value: string) => void;
  onFocus: (e: React.FocusEvent<HTMLInputElement>, currencyCode: string) => void;
  onToggleFavorite: (currencyCode: string) => void;
  onDragStart: (e: React.DragEvent, currencyCode: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, currencyCode: string) => void;
  onDragEnd: () => void;
  onMoveUp: (currencyCode: string) => void;
  onMoveDown: (currencyCode: string) => void;
}

const CurrencyCard = ({
  currency,
  value,
  isFavorite,
  isLastEdited,
  isDragged,
  isFirst,
  isLast,
  rates,
  onValueChange,
  onFocus,
  onToggleFavorite,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onMoveUp,
  onMoveDown,
}: CurrencyCardProps) => {
  // Format number with US locale
  const formatNumber = useCallback((num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  }, []);

  return (
    <div
      draggable={true}
      onDragStart={(e) => onDragStart(e, currency.code)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, currency.code)}
      onDragEnd={onDragEnd}
      className={`p-4 rounded-lg border-2 transition-all md:cursor-move relative ${
        currency.code === 'USD'
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
      } ${isFavorite ? 'ring-2 ring-yellow-300' : ''} ${
        isLastEdited ? 'ring-2 ring-green-400' : ''
      } ${isDragged ? 'opacity-50' : ''}`}
    >
      {/* Mobile sorting controls */}
      <div className="absolute right-2 top-2 flex flex-col gap-1 md:hidden">
        <button
          onClick={() => onMoveUp(currency.code)}
          disabled={isFirst}
          className={`w-6 h-6 flex items-center justify-center text-xs rounded border ${
            isFirst
              ? 'text-gray-300 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed'
              : 'text-gray-600 dark:text-gray-400 border-gray-400 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600'
          }`}
          title="Move up"
        >
          ↑
        </button>
        <button
          onClick={() => onMoveDown(currency.code)}
          disabled={isLast}
          className={`w-6 h-6 flex items-center justify-center text-xs rounded border ${
            isLast
              ? 'text-gray-300 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed'
              : 'text-gray-600 dark:text-gray-400 border-gray-400 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600'
          }`}
          title="Move down"
        >
          ↓
        </button>
      </div>

      {/* Desktop drag handle indicator */}
      <div className="absolute right-2 top-2 hidden md:flex items-center text-gray-400 dark:text-gray-500">
        <span className="text-sm select-none" title="Drag to reorder">⋮⋮</span>
      </div>

      <div className="flex items-center justify-between mb-2 pr-8 md:pr-6">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
            {currency.code}
          </span>
          <button
            onClick={() => onToggleFavorite(currency.code)}
            className={`p-1 rounded transition-colors ${
              isFavorite
                ? 'text-yellow-500 hover:text-yellow-600'
                : 'text-gray-400 hover:text-yellow-500'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? '★' : '☆'}
          </button>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {currency.symbol}
        </span>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        {currency.name}
      </p>

      {/* Editable amount input */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg font-medium text-gray-500 dark:text-gray-400 pointer-events-none">
          {currency.symbol}
        </span>
        <input
          type="text"
          inputMode="decimal"
          pattern="[0-9]*"
          value={value}
          onChange={(e) => onValueChange(currency.code, e.target.value)}
          onFocus={(e) => onFocus(e, currency.code)}
          className={`w-full ${
            currency.symbol.length >= 2 ? 'pl-14' : 'pl-8'
          } pr-3 py-2 text-xl font-bold bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded ${
            currency.code === 'USD'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-900 dark:text-gray-100'
          }`}
          placeholder="0.00"
        />
      </div>

      {rates && currency.code !== 'USD' && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Rate: {formatNumber(rates[currency.code] || 0)}
        </p>
      )}
    </div>
  );
};

export { CurrencyCard };