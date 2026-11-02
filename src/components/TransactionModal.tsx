import React, { useState, useEffect } from 'react';
import { Category, CurrencyConfig, PaymentMethod, Transaction, TransactionType } from '../types/budget';
import { CategoryIcon } from './CategoryIcon';
import { X, ArrowDownRight, ArrowUpRight, Calendar, CreditCard, DollarSign } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transactionData: Omit<Transaction, 'id' | 'createdAt'>, existingId?: string) => void;
  categories: Category[];
  currency: CurrencyConfig;
  initialTransaction?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  currency,
  initialTransaction,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Reset or initialize on open
  useEffect(() => {
    if (isOpen) {
      setError('');
      if (initialTransaction) {
        setType(initialTransaction.type);
        setAmount(initialTransaction.amount.toString());
        setCategoryId(initialTransaction.categoryId);
        setDescription(initialTransaction.description);
        setDate(initialTransaction.date);
        setPaymentMethod(initialTransaction.paymentMethod);
        setNotes(initialTransaction.notes || '');
      } else {
        const todayStr = new Date().toISOString().slice(0, 10);
        setType('expense');
        setAmount('');
        setDescription('');
        setDate(todayStr);
        setPaymentMethod('card');
        setNotes('');

        // default category to first expense category
        const firstExpenseCat = categories.find((c) => c.type === 'expense');
        setCategoryId(firstExpenseCat ? firstExpenseCat.id : categories[0]?.id || '');
      }
    }
  }, [isOpen, initialTransaction, categories]);

  // Adjust category if type changes
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const matching = categories.filter((c) => c.type === newType);
    if (matching.length > 0 && !matching.some((c) => c.id === categoryId)) {
      setCategoryId(matching[0].id);
    }
  };

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a description or payee.');
      return;
    }
    if (!categoryId) {
      setError('Please select a category.');
      return;
    }
    if (!date) {
      setError('Please choose a valid date.');
      return;
    }

    onSave(
      {
        type,
        amount: numAmount,
        categoryId,
        description: description.trim(),
        date,
        paymentMethod,
        notes: notes.trim() || undefined,
      },
      initialTransaction?.id
    );
    onClose();
  };

  const handleQuickAddAmount = (addVal: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + addVal).toFixed(2).replace(/\.00$/, ''));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h2 id="modal-title" className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              {initialTransaction ? 'Edit Transaction' : 'Record Transaction'}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Log an expense or income entry
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-lg border border-rose-200 dark:border-rose-900/50">
              {error}
            </div>
          )}

          {/* Type Segmented Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                type === 'expense'
                  ? 'bg-white dark:bg-neutral-900 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              <ArrowDownRight size={15} />
              Expense
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                type === 'income'
                  ? 'bg-white dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              <ArrowUpRight size={15} />
              Income
            </button>
          </div>

          {/* Amount Field with Currency Prefix & Quick Adder */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Amount
            </label>
            <div className="relative rounded-xl border border-neutral-300 dark:border-neutral-700 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 overflow-hidden bg-white dark:bg-neutral-900">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 font-mono text-base font-semibold">
                {currency.symbol}
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-4 py-2.5 text-lg font-bold font-mono tabular-nums bg-transparent text-neutral-900 dark:text-neutral-100 placeholder-neutral-300 dark:placeholder-neutral-600 focus:outline-none"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] text-neutral-400 dark:text-neutral-500 mr-1">Quick:</span>
              {[5, 10, 25, 50, 100].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAddAmount(val)}
                  className="px-2 py-0.5 text-[11px] font-mono text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
                >
                  +{currency.symbol}{val}
                </button>
              ))}
            </div>
          </div>

          {/* Description / Payee */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Description / Merchant / Payee
            </label>
            <input
              type="text"
              placeholder={type === 'expense' ? 'e.g. Supermarket, Netflix, Gas Station' : 'e.g. Client Payment, Bonus, Salary'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category Selector Grid */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50/50 dark:bg-neutral-900/50">
              {filteredCategories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs transition-all ${
                      isSelected
                        ? 'bg-white dark:bg-neutral-800 border-2 border-emerald-500 text-neutral-900 dark:text-neutral-100 shadow-xs font-medium'
                        : 'border border-transparent hover:bg-white/60 dark:hover:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <CategoryIcon
                      iconName={cat.iconName}
                      color={cat.color}
                      size={15}
                      className="w-6 h-6"
                    />
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Payment Method Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="card">Credit / Debit Card</option>
                <option value="cash">Cash</option>
                <option value="transfer">Bank Transfer</option>
                <option value="other">Other / Digital Wallet</option>
              </select>
            </div>
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="Add memo or receipt note..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
            >
              {initialTransaction ? 'Update Transaction' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
