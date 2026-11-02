import React from 'react';
import { CurrencyConfig } from '../types/budget';
import { CURRENCIES } from '../data/defaultData';
import { Plus, Sun, Moon, Database, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatMonthName } from '../utils/formatters';

interface NavbarProps {
  currentView: 'overview' | 'transactions' | 'categories' | 'analytics';
  onViewChange: (view: 'overview' | 'transactions' | 'categories' | 'analytics') => void;
  currency: CurrencyConfig;
  onCurrencyChange: (c: CurrencyConfig) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenAddModal: () => void;
  onOpenDataModal: () => void;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  currency,
  onCurrencyChange,
  isDarkMode,
  onToggleDarkMode,
  onOpenAddModal,
  onOpenDataModal,
  selectedMonth,
  onMonthChange,
}) => {
  // Navigate months back / forward
  const handleShiftMonth = (offset: number) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + offset, 1);
    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, '0');
    onMonthChange(`${newYear}-${newMonth}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onViewChange('overview')}
              className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100 hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 flex items-center gap-2"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                B
              </div>
              <span>BudgetPulse</span>
            </button>
          </div>

          {/* Zone 2: Navigation Links (4 concise, single-line text links) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600 dark:text-neutral-400">
            <button
              onClick={() => onViewChange('overview')}
              className={`hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors whitespace-nowrap shrink-0 ${
                currentView === 'overview'
                  ? 'text-neutral-900 dark:text-neutral-100 font-semibold'
                  : ''
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => onViewChange('transactions')}
              className={`hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors whitespace-nowrap shrink-0 ${
                currentView === 'transactions'
                  ? 'text-neutral-900 dark:text-neutral-100 font-semibold'
                  : ''
              }`}
            >
              Transactions
            </button>
            <button
              onClick={() => onViewChange('categories')}
              className={`hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors whitespace-nowrap shrink-0 ${
                currentView === 'categories'
                  ? 'text-neutral-900 dark:text-neutral-100 font-semibold'
                  : ''
              }`}
            >
              Budget Limits
            </button>
            <button
              onClick={() => onViewChange('analytics')}
              className={`hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors whitespace-nowrap shrink-0 ${
                currentView === 'analytics'
                  ? 'text-neutral-900 dark:text-neutral-100 font-semibold'
                  : ''
              }`}
            >
              Analytics
            </button>
          </nav>

          {/* Zone 3: 1 primary action + compact utility controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Month navigator */}
            <div className="hidden sm:flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg p-0.5 border border-neutral-200/60 dark:border-neutral-700/60">
              <button
                onClick={() => handleShiftMonth(-1)}
                title="Previous month"
                aria-label="Previous month"
                className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-semibold px-2 text-neutral-800 dark:text-neutral-200 whitespace-nowrap min-w-24 text-center">
                {formatMonthName(selectedMonth)}
              </span>
              <button
                onClick={() => handleShiftMonth(1)}
                title="Next month"
                aria-label="Next month"
                className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Currency selector */}
            <select
              value={currency.code}
              onChange={(e) => {
                const found = CURRENCIES.find((c) => c.code === e.target.value);
                if (found) onCurrencyChange(found);
              }}
              title="Change Currency"
              aria-label="Select currency"
              className="py-1 px-2 text-xs font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>

            {/* Data Backup button */}
            <button
              onClick={onOpenDataModal}
              title="Backup & Restore Data"
              aria-label="Backup and restore data"
              className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <Database size={16} />
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={onToggleDarkMode}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Primary Action Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">Add Transaction</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
          <button
            onClick={() => onViewChange('overview')}
            className={`py-1 px-2 font-medium ${
              currentView === 'overview'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onViewChange('transactions')}
            className={`py-1 px-2 font-medium ${
              currentView === 'transactions'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => onViewChange('categories')}
            className={`py-1 px-2 font-medium ${
              currentView === 'categories'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Limits
          </button>
          <button
            onClick={() => onViewChange('analytics')}
            className={`py-1 px-2 font-medium ${
              currentView === 'analytics'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Analytics
          </button>
        </div>
      </div>
    </header>
  );
};
