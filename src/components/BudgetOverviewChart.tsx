import React, { useState } from 'react';
import { Category, CurrencyConfig, Transaction } from '../types/budget';
import { formatCurrency } from '../utils/formatters';

interface BudgetOverviewChartProps {
  transactions: Transaction[];
  categories: Category[];
  currency: CurrencyConfig;
  selectedMonth: string;
}

export const BudgetOverviewChart: React.FC<BudgetOverviewChartProps> = ({
  transactions,
  categories,
  currency,
  selectedMonth,
}) => {
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);

  // Filter expenses for selected month
  const monthExpenses = transactions.filter(
    (tx) => tx.type === 'expense' && tx.date.startsWith(selectedMonth)
  );

  const totalExpense = monthExpenses.reduce((sum, tx) => sum + tx.amount, 0);

  // Group by category
  const categorySpendingMap = new Map<string, number>();
  monthExpenses.forEach((tx) => {
    const current = categorySpendingMap.get(tx.categoryId) || 0;
    categorySpendingMap.set(tx.categoryId, current + tx.amount);
  });

  const categoryData = Array.from(categorySpendingMap.entries())
    .map(([catId, spent]) => {
      const category = categories.find((c) => c.id === catId) || {
        id: catId,
        name: 'Uncategorized',
        color: '#94a3b8',
        monthlyBudget: 0,
        iconName: 'Tag',
        type: 'expense' as const,
      };
      const percentage = totalExpense > 0 ? (spent / totalExpense) * 100 : 0;
      return {
        ...category,
        spent,
        percentage,
      };
    })
    .sort((a, b) => b.spent - a.spent);

  // Calculate SVG donut paths
  const radius = 76;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;
  let accumulatedAngle = 0;

  // Daily Spending timeline
  const [yearStr, monthStr] = selectedMonth.split('-');
  const daysInMonth = new Date(Number(yearStr), Number(monthStr), 0).getDate();
  const dailySpending: { day: number; amount: number; dateStr: string }[] = [];

  for (let i = 1; i <= daysInMonth; i++) {
    const dayPadded = String(i).padStart(2, '0');
    const dateStr = `${selectedMonth}-${dayPadded}`;
    const dayTotal = monthExpenses
      .filter((tx) => tx.date === dateStr)
      .reduce((sum, tx) => sum + tx.amount, 0);
    dailySpending.push({ day: i, amount: dayTotal, dateStr });
  }

  const maxDaily = Math.max(...dailySpending.map((d) => d.amount), 50);

  const activeCategory = categoryData.find((c) => c.id === hoveredCategoryId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Category Breakdown Donut */}
      <div className="lg:col-span-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Expense Distribution
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Breakdown by category for current period
            </p>
          </div>
          <span className="text-xs font-mono tabular-nums text-neutral-500 dark:text-neutral-400">
            {categoryData.length} {categoryData.length === 1 ? 'Category' : 'Categories'}
          </span>
        </div>

        {totalExpense === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-400 dark:text-neutral-500">
            <div className="w-16 h-16 rounded-full border border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center mb-3">
              <span className="text-xs">0%</span>
            </div>
            <p className="text-xs">No expense transactions recorded for this month.</p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-6 my-auto pt-2">
            {/* SVG Donut */}
            <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="transparent"
                  stroke="currentColor"
                  className="text-neutral-100 dark:text-neutral-800"
                  strokeWidth={strokeWidth}
                />
                {categoryData.map((cat) => {
                  const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
                  const strokeDashoffset = -accumulatedAngle;
                  accumulatedAngle += (cat.percentage / 100) * circumference;
                  const isHovered = hoveredCategoryId === cat.id;

                  return (
                    <circle
                      key={cat.id}
                      cx="100"
                      cy="100"
                      r={radius}
                      fill="transparent"
                      stroke={cat.color}
                      strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-200 cursor-pointer"
                      style={{ opacity: hoveredCategoryId && !isHovered ? 0.35 : 1 }}
                      onMouseEnter={() => setHoveredCategoryId(cat.id)}
                      onMouseLeave={() => setHoveredCategoryId(null)}
                    />
                  );
                })}
              </svg>

              {/* Donut Center Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  {activeCategory ? activeCategory.name : 'Total Spent'}
                </span>
                <span className="text-lg font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(activeCategory ? activeCategory.spent : totalExpense, currency)}
                </span>
                {activeCategory && (
                  <span className="text-[11px] font-mono tabular-nums text-neutral-500 dark:text-neutral-400">
                    {activeCategory.percentage.toFixed(1)}% of total
                  </span>
                )}
              </div>
            </div>

            {/* Category Legend */}
            <div className="flex-1 w-full space-y-2 max-h-48 overflow-y-auto pr-1">
              {categoryData.map((cat) => {
                const isHovered = hoveredCategoryId === cat.id;
                return (
                  <div
                    key={cat.id}
                    onMouseEnter={() => setHoveredCategoryId(cat.id)}
                    onMouseLeave={() => setHoveredCategoryId(null)}
                    className={`flex items-center justify-between text-xs py-1.5 px-2 rounded-lg cursor-pointer transition-colors ${
                      isHovered
                        ? 'bg-neutral-100 dark:bg-neutral-800'
                        : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="truncate text-neutral-800 dark:text-neutral-200 font-medium">
                        {cat.name}
                      </span>
                    </div>
                    <div className="text-right shrink-0 font-mono tabular-nums text-neutral-600 dark:text-neutral-400">
                      <span>{formatCurrency(cat.spent, currency)}</span>
                      <span className="text-neutral-400 dark:text-neutral-500 ml-1.5 text-[10px]">
                        {cat.percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Daily Spending Trend Timeline */}
      <div className="lg:col-span-7 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Daily Spending Timeline
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Expenditure cadence across {daysInMonth} days
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono tabular-nums text-neutral-500 dark:text-neutral-400">
              Peak: {formatCurrency(Math.max(...dailySpending.map((d) => d.amount)), currency)}
            </span>
          </div>
        </div>

        {totalExpense === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-400 dark:text-neutral-500">
            <p className="text-xs">No daily expenditure activity to show.</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-end pt-4">
            <div className="h-40 flex items-end gap-1 sm:gap-1.5 w-full">
              {dailySpending.map((dayData) => {
                const heightPercent = maxDaily > 0 ? (dayData.amount / maxDaily) * 100 : 0;
                const hasSpend = dayData.amount > 0;

                return (
                  <div
                    key={dayData.day}
                    className="flex-1 flex flex-col items-center group relative h-full justify-end"
                  >
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute bottom-full mb-2 z-20 transition-opacity bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-[10px] font-mono py-1 px-2 rounded-md shadow-md whitespace-nowrap">
                      <div>Day {dayData.day}</div>
                      <div className="font-bold">{formatCurrency(dayData.amount, currency)}</div>
                    </div>

                    {/* Bar */}
                    <div
                      className={`w-full rounded-t-sm transition-all duration-200 ${
                        hasSpend
                          ? 'bg-emerald-500 hover:bg-emerald-400 dark:bg-emerald-600 dark:hover:bg-emerald-500'
                          : 'bg-neutral-100 dark:bg-neutral-800'
                      }`}
                      style={{
                        height: hasSpend ? `${Math.max(6, heightPercent)}%` : '4px',
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Day Axis */}
            <div className="flex justify-between text-[10px] font-mono text-neutral-400 dark:text-neutral-500 mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <span>Day 1</span>
              <span>Day 10</span>
              <span>Day 20</span>
              <span>Day {daysInMonth}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
