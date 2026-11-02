import React, { useState, useMemo } from 'react';
import { Category, CurrencyConfig, Transaction, TransactionType } from '../types/budget';
import { formatCurrency, formatDatePretty, exportTransactionsToCSV } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { Search, Download, Trash2, Edit3, Filter, Plus, ArrowUpDown } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  currency: CurrencyConfig;
  selectedMonth: string;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
  onOpenAddModal: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  categories,
  currency,
  selectedMonth,
  onEdit,
  onDelete,
  onOpenAddModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<TransactionType | 'all'>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [sortOption, setSortOption] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  // Filter transactions for current view
  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Must match month
        if (!tx.date.startsWith(selectedMonth)) return false;

        // Type filter
        if (selectedType !== 'all' && tx.type !== selectedType) return false;

        // Category filter
        if (selectedCategoryId !== 'all' && tx.categoryId !== selectedCategoryId) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const cat = categoryMap.get(tx.categoryId);
          const matchDesc = tx.description.toLowerCase().includes(q);
          const matchCat = cat?.name.toLowerCase().includes(q);
          const matchNotes = tx.notes?.toLowerCase().includes(q);
          const matchAmount = tx.amount.toString().includes(q);
          if (!matchDesc && !matchCat && !matchNotes && !matchAmount) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'date-desc') {
          return new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt;
        }
        if (sortOption === 'date-asc') {
          return new Date(a.date).getTime() - new Date(b.date).getTime() || a.createdAt - b.createdAt;
        }
        if (sortOption === 'amount-desc') {
          return b.amount - a.amount;
        }
        if (sortOption === 'amount-asc') {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [transactions, selectedMonth, selectedType, selectedCategoryId, searchQuery, sortOption, categoryMap]);

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs overflow-hidden">
      {/* Controls Header */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Transactions
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {filteredTransactions.length} {filteredTransactions.length === 1 ? 'record' : 'records'} logged
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportTransactionsToCSV(filteredTransactions, categories, currency)}
              disabled={filteredTransactions.length === 0}
              title="Download CSV report"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:pointer-events-none rounded-lg transition-colors"
            >
              <Download size={13} />
              <span>CSV</span>
            </button>
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
            >
              <Plus size={14} />
              <span>New Entry</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
          {/* Search Box */}
          <div className="sm:col-span-5 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search payees, notes, amounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Type Segmented buttons */}
          <div className="sm:col-span-3 flex items-center p-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
            {(['all', 'expense', 'income'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`flex-1 py-1 text-xs capitalize font-medium rounded-md transition-colors ${
                  selectedType === t
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                {t === 'all' ? 'All' : t}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div className="sm:col-span-2">
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full py-1.5 px-2 text-xs bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="sm:col-span-2">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="w-full py-1.5 px-2 text-xs bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="date-desc">Newest Date</option>
              <option value="date-asc">Oldest Date</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction List Rows */}
      {filteredTransactions.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 mb-3">
            <Filter size={20} />
          </div>
          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            No transactions found
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm">
            {searchQuery || selectedType !== 'all' || selectedCategoryId !== 'all'
              ? 'Try adjusting your filters or search keywords.'
              : 'Start tracking your money by recording your first transaction for this month.'}
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-4 px-4 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 rounded-lg transition-colors"
          >
            Log Transaction
          </button>
        </div>
      ) : (
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {filteredTransactions.map((tx) => {
            const cat = categoryMap.get(tx.categoryId) || {
              id: tx.categoryId,
              name: 'Uncategorized',
              color: '#94a3b8',
              iconName: 'Tag',
              monthlyBudget: 0,
              type: tx.type,
            };

            const isIncome = tx.type === 'income';

            return (
              <div
                key={tx.id}
                className="group flex items-center justify-between p-3.5 hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors"
              >
                {/* Left: Icon & Description */}
                <div className="flex items-center gap-3 min-w-0 mr-3">
                  <CategoryIcon
                    iconName={cat.iconName}
                    color={cat.color}
                    size={17}
                    className="w-9 h-9"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                        {tx.description}
                      </h4>
                    </div>

                    {/* Metadata line (Zero-pill discipline) */}
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      <span>{cat.name}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatDatePretty(tx.date)}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{tx.paymentMethod}</span>
                      {tx.notes && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="italic truncate max-w-xs">{tx.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span
                      className={`text-sm font-bold font-mono tabular-nums ${
                        isIncome
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-neutral-900 dark:text-neutral-100'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatCurrency(tx.amount, currency)}
                    </span>
                  </div>

                  {/* Quick Edit/Delete Row Actions */}
                  <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(tx)}
                      title="Edit transaction"
                      className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-700 rounded-md transition-colors"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(tx.id)}
                      title="Delete transaction"
                      className="p-1.5 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
