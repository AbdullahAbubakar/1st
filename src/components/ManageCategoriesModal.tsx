import React, { useState } from 'react';
import { Category, CurrencyConfig, TransactionType } from '../types/budget';
import { CategoryIcon, AVAILABLE_ICONS } from './CategoryIcon';
import { formatCurrency } from '../utils/formatters';
import { X, Plus, Trash2, Check, AlertCircle } from 'lucide-react';

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  currency: CurrencyConfig;
  onAddCategory: (newCategory: Omit<Category, 'id'>) => void;
  onUpdateCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
}

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#f43f5e', // rose
  '#14b8a6', // teal
  '#6366f1', // indigo
  '#eab308', // yellow
  '#64748b', // slate
];

export const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({
  isOpen,
  onClose,
  categories,
  currency,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [name, setName] = useState('');
  const [monthlyBudget, setMonthlyBudget] = useState('200');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [iconName, setIconName] = useState('Tag');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === activeTab);

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a category name');
      return;
    }

    const budgetNum = activeTab === 'expense' ? parseFloat(monthlyBudget) || 0 : 0;

    onAddCategory({
      name: name.trim(),
      type: activeTab,
      monthlyBudget: budgetNum,
      color,
      iconName,
    });

    setName('');
    setMonthlyBudget('200');
    setIsAddingNew(false);
    setError('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="manage-categories-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h2 id="manage-categories-title" className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Categories & Budget Limits
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Customize spending categories and target caps
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

        {/* Tab switcher: Expense vs Income */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-2 gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
            <button
              onClick={() => {
                setActiveTab('expense');
                setIsAddingNew(false);
              }}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'expense'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              Expense Categories ({categories.filter((c) => c.type === 'expense').length})
            </button>
            <button
              onClick={() => {
                setActiveTab('income');
                setIsAddingNew(false);
              }}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'income'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              Income Sources ({categories.filter((c) => c.type === 'income').length})
            </button>
          </div>
        </div>

        {/* Category List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 rounded-xl"
            >
              <div className="flex items-center gap-3 min-w-0">
                <CategoryIcon
                  iconName={cat.iconName}
                  color={cat.color}
                  size={18}
                  className="w-8 h-8"
                />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                    {cat.name}
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 font-mono tabular-nums">
                    {cat.type === 'expense'
                      ? cat.monthlyBudget > 0
                        ? `Monthly budget: ${formatCurrency(cat.monthlyBudget, currency)}`
                        : 'No monthly cap'
                      : 'Income stream'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onDeleteCategory(cat.id)}
                  title="Delete category"
                  className="p-1.5 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          {/* New Category Form Drawer */}
          {isAddingNew ? (
            <form
              onSubmit={handleCreateNew}
              className="p-4 bg-emerald-50/50 dark:bg-neutral-800/80 border border-emerald-200 dark:border-neutral-700 rounded-xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  Add New {activeTab === 'expense' ? 'Expense Category' : 'Income Source'}
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <X size={14} />
                </button>
              </div>

              {error && <p className="text-xs text-rose-600">{error}</p>}

              <div>
                <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Subscriptions, Coffee, Pet Supplies"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {activeTab === 'expense' && (
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    Monthly Budget Target ({currency.symbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    placeholder="250"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              )}

              {/* Color picker */}
              <div>
                <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Color Accent
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        color === c ? 'ring-2 ring-offset-2 ring-emerald-500 scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Icon selection */}
              <div>
                <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Icon
                </label>
                <div className="grid grid-cols-6 gap-1 max-h-24 overflow-y-auto p-1 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                  {AVAILABLE_ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIconName(ic)}
                      className={`p-1.5 flex items-center justify-center rounded-md ${
                        iconName === ic
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <CategoryIcon iconName={ic} size={15} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                >
                  Save Category
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingNew(true)}
              className="w-full py-2.5 border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus size={14} />
              Add Custom {activeTab === 'expense' ? 'Category' : 'Income Source'}
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
