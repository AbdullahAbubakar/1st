import React, { useState } from 'react';
import { Category, CurrencyConfig, Transaction } from '../types/budget';
import { formatCurrency } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { Edit2, Check, X, AlertTriangle } from 'lucide-react';

interface CategoryBudgetCardProps {
  category: Category;
  transactions: Transaction[];
  currency: CurrencyConfig;
  selectedMonth: string;
  onUpdateBudget: (categoryId: string, newLimit: number) => void;
}

export const CategoryBudgetCard: React.FC<CategoryBudgetCardProps> = ({
  category,
  transactions,
  currency,
  selectedMonth,
  onUpdateBudget,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(category.monthlyBudget.toString());

  // Calculate spent in selected month
  const spent = transactions
    .filter(
      (tx) =>
        tx.categoryId === category.id &&
        tx.type === 'expense' &&
        tx.date.startsWith(selectedMonth)
    )
    .reduce((sum, tx) => sum + tx.amount, 0);

  const budget = category.monthlyBudget;
  const percentUsed = budget > 0 ? (spent / budget) * 100 : 0;
  const isOverBudget = budget > 0 && spent > budget;
  const remaining = budget > 0 ? budget - spent : 0;

  const handleSave = () => {
    const parsed = parseFloat(editValue);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateBudget(category.id, parsed);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(category.monthlyBudget.toString());
    setIsEditing(false);
  };

  // Color logic for the progress bar
  let progressColor = 'bg-emerald-500';
  if (percentUsed > 100) {
    progressColor = 'bg-rose-500';
  } else if (percentUsed >= 85) {
    progressColor = 'bg-amber-500';
  }

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <CategoryIcon
            iconName={category.iconName}
            color={category.color}
            size={18}
            className="w-8 h-8"
          />
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
              {category.name}
            </h4>
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              {budget > 0 ? (
                <>
                  <span className="font-mono tabular-nums">
                    {formatCurrency(spent, currency)} spent
                  </span>
                  <span>·</span>
                  <span className="font-mono tabular-nums">
                    {formatCurrency(budget, currency)} budget
                  </span>
                </>
              ) : (
                <span className="font-mono tabular-nums">
                  {formatCurrency(spent, currency)} spent · No limit
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Edit Budget Limit Toggle */}
        <div className="shrink-0">
          {isEditing ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                step="10"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                  if (e.key === 'Escape') handleCancel();
                }}
                autoFocus
                className="w-20 px-2 py-1 text-xs font-mono bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                onClick={handleSave}
                aria-label="Save limit"
                className="p-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
              >
                <Check size={14} />
              </button>
              <button
                onClick={handleCancel}
                aria-label="Cancel editing"
                className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setEditValue(category.monthlyBudget.toString());
                setIsEditing(true);
              }}
              title="Edit monthly budget limit"
              className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
            >
              <Edit2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar & Status */}
      {budget > 0 ? (
        <div className="space-y-1.5">
          <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${progressColor}`}
              style={{ width: `${Math.min(100, percentUsed)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 font-mono tabular-nums">
              {isOverBudget ? (
                <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
                  <AlertTriangle size={12} />
                  Over by {formatCurrency(Math.abs(remaining), currency)}
                </span>
              ) : (
                <span className="text-neutral-600 dark:text-neutral-400">
                  {formatCurrency(remaining, currency)} remaining
                </span>
              )}
            </div>
            <span
              className={`font-mono tabular-nums font-medium ${
                isOverBudget
                  ? 'text-rose-600 dark:text-rose-400'
                  : percentUsed >= 85
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-neutral-500 dark:text-neutral-400'
              }`}
            >
              {percentUsed.toFixed(0)}%
            </span>
          </div>
        </div>
      ) : (
        <div className="pt-1 text-xs text-neutral-400 dark:text-neutral-500 flex items-center justify-between">
          <span>Uncapped category</span>
          <button
            onClick={() => {
              setEditValue('200');
              setIsEditing(true);
            }}
            className="text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Set a limit
          </button>
        </div>
      )}
    </div>
  );
};
