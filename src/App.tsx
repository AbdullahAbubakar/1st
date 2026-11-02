/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Category, CurrencyConfig, Transaction } from './types/budget';
import { CURRENCIES, DEFAULT_CATEGORIES, getInitialTransactions } from './data/defaultData';
import { Navbar } from './components/Navbar';
import { MetricStrip } from './components/MetricStrip';
import { BudgetOverviewChart } from './components/BudgetOverviewChart';
import { CategoryBudgetCard } from './components/CategoryBudgetCard';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { ManageCategoriesModal } from './components/ManageCategoriesModal';
import { ExportImportModal } from './components/ExportImportModal';
import { formatCurrency, formatMonthName } from './utils/formatters';
import {
  Plus,
  Sliders,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  FolderPlus,
  RefreshCw,
  Wallet
} from 'lucide-react';

const STORAGE_KEYS = {
  TRANSACTIONS: 'budgetpulse_transactions_v1',
  CATEGORIES: 'budgetpulse_categories_v1',
  CURRENCY: 'budgetpulse_currency_v1',
  DARK_MODE: 'budgetpulse_theme_dark_v1',
};

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
    if (saved !== null) {
      return saved === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Currency
  const [currency, setCurrency] = useState<CurrencyConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENCY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return CURRENCIES[0];
  });

  // Categories
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return DEFAULT_CATEGORIES;
  });

  // Transactions
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return getInitialTransactions();
  });

  // Month navigation (Defaults to current month YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Current view tab
  const [currentView, setCurrentView] = useState<'overview' | 'transactions' | 'categories' | 'analytics'>('overview');

  // Modals
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);

  // Quick toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  // Sync dark class on documentElement
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, 'false');
    }
  }, [isDarkMode]);

  // Persist categories
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  // Persist transactions
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  // Persist currency
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENCY, JSON.stringify(currency));
  }, [currency]);

  // Transaction Actions
  const handleSaveTransaction = (
    data: Omit<Transaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === existingId ? { ...t, ...data } : t))
      );
      showToast('Transaction updated');
    } else {
      const newTx: Transaction = {
        ...data,
        id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: Date.now(),
      };
      setTransactions((prev) => [newTx, ...prev]);
      showToast('Transaction recorded');
    }
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Transaction deleted');
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsTxModalOpen(true);
  };

  // Category Actions
  const handleUpdateBudgetLimit = (categoryId: string, newLimit: number) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, monthlyBudget: newLimit } : c))
    );
    showToast('Category limit updated');
  };

  const handleAddCategory = (newCat: Omit<Category, 'id'>) => {
    const id = `cat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setCategories((prev) => [...prev, { ...newCat, id }]);
    showToast(`Added category "${newCat.name}"`);
  };

  const handleUpdateCategory = (cat: Category) => {
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? cat : c)));
    showToast('Category updated');
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    showToast('Category removed');
  };

  // Maintenance & Backup Actions
  const handleImportData = (imported: { transactions: Transaction[]; categories?: Category[] }) => {
    setTransactions(imported.transactions);
    if (imported.categories && imported.categories.length > 0) {
      setCategories(imported.categories);
    }
    showToast('Data imported successfully');
  };

  const handleResetDemoData = () => {
    setTransactions(getInitialTransactions());
    setCategories(DEFAULT_CATEGORIES);
    showToast('Reset to starter sample data');
  };

  const handleClearAllData = () => {
    setTransactions([]);
    showToast('All transaction logs cleared');
  };

  // Filtered expenses for month
  const monthExpenses = transactions.filter(
    (t) => t.type === 'expense' && t.date.startsWith(selectedMonth)
  );
  const totalMonthExpense = monthExpenses.reduce((sum, t) => sum + t.amount, 0);

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col transition-colors">
      {/* Top Bar following Top Bar Contract */}
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        currency={currency}
        onCurrencyChange={setCurrency}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsTxModalOpen(true);
        }}
        onOpenDataModal={() => setIsDataModalOpen(true)}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
      />

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Month Title & Fast-Add Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/70 dark:border-neutral-800/70">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              <span>Financial Workspace</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                {formatMonthName(selectedMonth)}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mt-0.5">
              Budget & Expense Summary
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCategoriesModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg transition-colors shadow-xs"
            >
              <Sliders size={14} />
              <span>Configure Limits</span>
            </button>
            <button
              onClick={() => {
                setEditingTransaction(null);
                setIsTxModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
            >
              <Plus size={14} />
              <span>New Entry</span>
            </button>
          </div>
        </div>

        {/* 1. Primary Metrics Strip */}
        <MetricStrip
          transactions={transactions}
          categories={categories}
          currency={currency}
          selectedMonth={selectedMonth}
        />

        {/* Content Views */}
        {currentView === 'overview' && (
          <div className="space-y-6">
            {/* Visual Analytics Preview */}
            <BudgetOverviewChart
              transactions={transactions}
              categories={categories}
              currency={currency}
              selectedMonth={selectedMonth}
            />

            {/* Category Budgets Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    Category Budgets
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Monthly spending targets vs. actuals
                  </p>
                </div>
                <button
                  onClick={() => setIsCategoriesModalOpen(true)}
                  className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>Manage all categories</span>
                  <ArrowRight size={12} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {expenseCategories.slice(0, 6).map((category) => (
                  <CategoryBudgetCard
                    key={category.id}
                    category={category}
                    transactions={transactions}
                    currency={currency}
                    selectedMonth={selectedMonth}
                    onUpdateBudget={handleUpdateBudgetLimit}
                  />
                ))}
              </div>
            </div>

            {/* Recent Transactions List */}
            <div className="space-y-3 pt-2">
              <TransactionList
                transactions={transactions}
                categories={categories}
                currency={currency}
                selectedMonth={selectedMonth}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
                onOpenAddModal={() => {
                  setEditingTransaction(null);
                  setIsTxModalOpen(true);
                }}
              />
            </div>
          </div>
        )}

        {currentView === 'transactions' && (
          <div className="space-y-4">
            <TransactionList
              transactions={transactions}
              categories={categories}
              currency={currency}
              selectedMonth={selectedMonth}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
              onOpenAddModal={() => {
                setEditingTransaction(null);
                setIsTxModalOpen(true);
              }}
            />
          </div>
        )}

        {currentView === 'categories' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Category Limits & Allowances
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Click the pencil icon on any category to calibrate its monthly ceiling
                </p>
              </div>
              <button
                onClick={() => setIsCategoriesModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
              >
                <FolderPlus size={14} />
                <span>Add / Edit Categories</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {expenseCategories.map((category) => (
                <CategoryBudgetCard
                  key={category.id}
                  category={category}
                  transactions={transactions}
                  currency={currency}
                  selectedMonth={selectedMonth}
                  onUpdateBudget={handleUpdateBudgetLimit}
                />
              ))}
            </div>
          </div>
        )}

        {currentView === 'analytics' && (
          <div className="space-y-6">
            <BudgetOverviewChart
              transactions={transactions}
              categories={categories}
              currency={currency}
              selectedMonth={selectedMonth}
            />

            {/* In-depth Monthly Summary Table */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                Category Spending Breakdown
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                Detailed audit of expenses against allocated thresholds for {formatMonthName(selectedMonth)}
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      <th className="py-2.5 px-3 font-semibold">Category</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Transactions</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Budget Target</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Actual Spent</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Variance / Remaining</th>
                      <th className="py-2.5 px-3 font-semibold text-right">% of Budget</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-mono tabular-nums">
                    {expenseCategories.map((cat) => {
                      const catTxs = monthExpenses.filter((t) => t.categoryId === cat.id);
                      const spent = catTxs.reduce((sum, t) => sum + t.amount, 0);
                      const budget = cat.monthlyBudget;
                      const variance = budget > 0 ? budget - spent : 0;
                      const percent = budget > 0 ? (spent / budget) * 100 : 0;

                      return (
                        <tr
                          key={cat.id}
                          className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
                        >
                          <td className="py-3 px-3 font-sans font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: cat.color }}
                            />
                            <span>{cat.name}</span>
                          </td>
                          <td className="py-3 px-3 text-right text-neutral-600 dark:text-neutral-400">
                            {catTxs.length}
                          </td>
                          <td className="py-3 px-3 text-right text-neutral-600 dark:text-neutral-400">
                            {budget > 0 ? formatCurrency(budget, currency) : '—'}
                          </td>
                          <td className="py-3 px-3 text-right font-semibold text-neutral-900 dark:text-neutral-100">
                            {formatCurrency(spent, currency)}
                          </td>
                          <td
                            className={`py-3 px-3 text-right font-medium ${
                              variance < 0
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {budget > 0
                              ? `${variance < 0 ? '-' : '+'}${formatCurrency(Math.abs(variance), currency)}`
                              : '—'}
                          </td>
                          <td className="py-3 px-3 text-right text-neutral-700 dark:text-neutral-300">
                            {budget > 0 ? `${percent.toFixed(0)}%` : '—'}
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
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900 py-6 mt-12 text-center text-xs text-neutral-500 dark:text-neutral-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">BudgetPulse</span>
            <span>·</span>
            <span>Local & Private Personal Budget Tracker</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setIsDataModalOpen(true)}
              className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              Export CSV / JSON Backup
            </button>
            <span>·</span>
            <button
              onClick={handleResetDemoData}
              className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              Reset Sample Data
            </button>
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-4 py-2.5 rounded-xl shadow-lg text-xs font-medium flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-150">
          <CheckCircle size={15} className="text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        categories={categories}
        currency={currency}
        initialTransaction={editingTransaction}
      />

      {/* Category Management Modal */}
      <ManageCategoriesModal
        isOpen={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
        categories={categories}
        currency={currency}
        onAddCategory={handleAddCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      {/* Export / Import & Data Modal */}
      <ExportImportModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        transactions={transactions}
        categories={categories}
        currency={currency}
        onImportData={handleImportData}
        onResetDemoData={handleResetDemoData}
        onClearAllData={handleClearAllData}
      />
    </div>
  );
}
