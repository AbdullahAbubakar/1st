import React from 'react';
import { Category, CurrencyConfig, Transaction } from '../types/budget';
import { formatCurrency, getDaysRemainingInMonth } from '../utils/formatters';
import { Wallet, TrendingDown, ArrowUpRight, Calendar, AlertCircle } from 'lucide-react';

interface MetricStripProps {
  transactions: Transaction[];
  categories: Category[];
  currency: CurrencyConfig;
  selectedMonth: string;
}

export const MetricStrip: React.FC<MetricStripProps> = ({
  transactions,
  categories,
  currency,
  selectedMonth,
}) => {
  // Filter for selected month
  const monthTransactions = transactions.filter((tx) => tx.date.startsWith(selectedMonth));

  const totalExpense = monthTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalIncome = monthTransactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalBudgetedLimit = categories
    .filter((c) => c.type === 'expense')
    .reduce((sum, c) => sum + c.monthlyBudget, 0);

  const netCashFlow = totalIncome - totalExpense;
  const remainingBudget = totalBudgetedLimit - totalExpense;
  const percentUsed = totalBudgetedLimit > 0 ? (totalExpense / totalBudgetedLimit) * 100 : 0;

  const { daysLeft } = getDaysRemainingInMonth(selectedMonth);
  const dailyAllowance = daysLeft > 0 && remainingBudget > 0 ? remainingBudget / daysLeft : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Monthly Budget */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
          <span className="text-xs font-medium">Total Budget Target</span>
          <Wallet size={16} className="text-neutral-400 dark:text-neutral-500" />
        </div>
        <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
          {formatCurrency(totalBudgetedLimit, currency)}
        </div>
        <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-mono tabular-nums">
          Across {categories.filter((c) => c.type === 'expense' && c.monthlyBudget > 0).length} capped categories
        </div>
      </div>

      {/* 2. Total Spent */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
          <span className="text-xs font-medium">Total Spent</span>
          <TrendingDown size={16} className="text-neutral-400 dark:text-neutral-500" />
        </div>
        <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
          {formatCurrency(totalExpense, currency)}
        </div>
        <div className="flex items-center gap-2 text-xs mt-1">
          <span
            className={`font-mono tabular-nums font-semibold ${
              percentUsed > 100
                ? 'text-rose-600 dark:text-rose-400'
                : percentUsed >= 85
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {percentUsed.toFixed(1)}% of budget
          </span>
          <span className="text-neutral-400">·</span>
          <span className="text-neutral-500 dark:text-neutral-400 font-mono tabular-nums">
            {monthTransactions.filter((tx) => tx.type === 'expense').length} purchases
          </span>
        </div>
      </div>

      {/* 3. Remaining Budget & Daily Safe Burn */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
          <span className="text-xs font-medium">Remaining Balance</span>
          {remainingBudget < 0 ? (
            <AlertCircle size={16} className="text-rose-500" />
          ) : (
            <Calendar size={16} className="text-neutral-400 dark:text-neutral-500" />
          )}
        </div>
        <div
          className={`text-2xl font-bold font-mono tabular-nums ${
            remainingBudget < 0
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-neutral-900 dark:text-neutral-100'
          }`}
        >
          {formatCurrency(remainingBudget, currency)}
        </div>
        <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-mono tabular-nums">
          {daysLeft > 0 && remainingBudget > 0 ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              ~{formatCurrency(dailyAllowance, currency)}/day for {daysLeft} days
            </span>
          ) : remainingBudget < 0 ? (
            <span className="text-rose-600 dark:text-rose-400 font-medium">
              Exceeded budget limit
            </span>
          ) : (
            <span>Month completed</span>
          )}
        </div>
      </div>

      {/* 4. Net Cash Flow (Income vs Expense) */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
          <span className="text-xs font-medium">Net Savings / Cashflow</span>
          <ArrowUpRight
            size={16}
            className={netCashFlow >= 0 ? 'text-emerald-500' : 'text-rose-500'}
          />
        </div>
        <div
          className={`text-2xl font-bold font-mono tabular-nums ${
            netCashFlow >= 0
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-rose-600 dark:text-rose-400'
          }`}
        >
          {netCashFlow >= 0 ? '+' : ''}
          {formatCurrency(netCashFlow, currency)}
        </div>
        <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-mono tabular-nums">
          Income: {formatCurrency(totalIncome, currency)}
        </div>
      </div>
    </div>
  );
};
