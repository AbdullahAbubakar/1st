import { Category, CurrencyConfig, Transaction } from '../types/budget';

export const CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', symbol: '$', label: 'USD ($)' },
  { code: 'EUR', symbol: '€', label: 'EUR (€)' },
  { code: 'GBP', symbol: '£', label: 'GBP (£)' },
  { code: 'JPY', symbol: '¥', label: 'JPY (¥)' },
  { code: 'CAD', symbol: 'CA$', label: 'CAD (CA$)' },
  { code: 'AUD', symbol: 'AU$', label: 'AUD (AU$)' },
  { code: 'INR', symbol: '₹', label: 'INR (₹)' },
];

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-housing', name: 'Housing & Rent', color: '#3b82f6', monthlyBudget: 1200, iconName: 'Home', type: 'expense' },
  { id: 'cat-groceries', name: 'Groceries', color: '#10b981', monthlyBudget: 550, iconName: 'ShoppingCart', type: 'expense' },
  { id: 'cat-dining', name: 'Dining & Cafes', color: '#f59e0b', monthlyBudget: 320, iconName: 'Coffee', type: 'expense' },
  { id: 'cat-transport', name: 'Transportation', color: '#8b5cf6', monthlyBudget: 180, iconName: 'Car', type: 'expense' },
  { id: 'cat-utilities', name: 'Utilities & Bills', color: '#06b6d4', monthlyBudget: 160, iconName: 'Zap', type: 'expense' },
  { id: 'cat-entertainment', name: 'Entertainment', color: '#ec4899', monthlyBudget: 140, iconName: 'Film', type: 'expense' },
  { id: 'cat-shopping', name: 'Shopping & Gear', color: '#f43f5e', monthlyBudget: 220, iconName: 'ShoppingBag', type: 'expense' },
  { id: 'cat-health', name: 'Health & Wellness', color: '#14b8a6', monthlyBudget: 120, iconName: 'HeartPulse', type: 'expense' },
  { id: 'cat-salary', name: 'Salary & Wages', color: '#22c55e', monthlyBudget: 0, iconName: 'Briefcase', type: 'income' },
  { id: 'cat-freelance', name: 'Freelance & Side Gig', color: '#6366f1', monthlyBudget: 0, iconName: 'Laptop', type: 'income' },
  { id: 'cat-investments', name: 'Dividends & Interest', color: '#eab308', monthlyBudget: 0, iconName: 'TrendingUp', type: 'income' },
];

export function getInitialTransactions(): Transaction[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = now.getDate();

  const makeDate = (d: number) => {
    const clampedDay = Math.min(Math.max(1, d), 28);
    return `${year}-${month}-${String(clampedDay).padStart(2, '0')}`;
  };

  return [
    {
      id: 'tx-1',
      date: makeDate(1),
      amount: 4200,
      type: 'income',
      categoryId: 'cat-salary',
      description: 'Monthly Salary Direct Deposit',
      paymentMethod: 'transfer',
      createdAt: Date.now() - 86400000 * 2,
    },
    {
      id: 'tx-2',
      date: makeDate(1),
      amount: 1200,
      type: 'expense',
      categoryId: 'cat-housing',
      description: 'Apartment Monthly Rent',
      paymentMethod: 'transfer',
      createdAt: Date.now() - 86400000 * 2,
    },
    {
      id: 'tx-3',
      date: makeDate(Math.max(1, day - 1)),
      amount: 86.45,
      type: 'expense',
      categoryId: 'cat-groceries',
      description: 'Trader Joe’s Fresh Groceries',
      paymentMethod: 'card',
      createdAt: Date.now() - 86400000,
    },
    {
      id: 'tx-4',
      date: makeDate(day),
      amount: 14.80,
      type: 'expense',
      categoryId: 'cat-dining',
      description: 'Artisan Espresso & Almond Croissant',
      paymentMethod: 'card',
      createdAt: Date.now() - 3600000 * 4,
    },
    {
      id: 'tx-5',
      date: makeDate(Math.max(1, day - 1)),
      amount: 45.00,
      type: 'expense',
      categoryId: 'cat-transport',
      description: 'Metro Transit Card Top-up',
      paymentMethod: 'card',
      createdAt: Date.now() - 86400000 * 1.5,
    },
    {
      id: 'tx-6',
      date: makeDate(1),
      amount: 79.99,
      type: 'expense',
      categoryId: 'cat-utilities',
      description: 'High-speed Fiber Internet',
      paymentMethod: 'card',
      createdAt: Date.now() - 86400000 * 2,
    },
    {
      id: 'tx-7',
      date: makeDate(day),
      amount: 320.00,
      type: 'income',
      categoryId: 'cat-freelance',
      description: 'UI Design Consultation Payment',
      paymentMethod: 'transfer',
      createdAt: Date.now() - 3600000 * 6,
    },
    {
      id: 'tx-8',
      date: makeDate(Math.max(1, day)),
      amount: 38.50,
      type: 'expense',
      categoryId: 'cat-dining',
      description: 'Dinner with Colleagues',
      paymentMethod: 'card',
      createdAt: Date.now() - 3600000 * 1,
    },
    {
      id: 'tx-9',
      date: makeDate(Math.max(1, day - 2)),
      amount: 55.00,
      type: 'expense',
      categoryId: 'cat-health',
      description: 'Monthly Rock Climbing Gym Pass',
      paymentMethod: 'card',
      createdAt: Date.now() - 86400000 * 2,
    },
  ];
}
