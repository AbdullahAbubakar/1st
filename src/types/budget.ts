export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'card' | 'cash' | 'transfer' | 'other';

export interface Category {
  id: string;
  name: string;
  color: string;
  monthlyBudget: number; // monthly limit for expenses, or 0 if unbudgeted
  iconName: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  type: TransactionType;
  categoryId: string;
  description: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: number;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  label: string;
}

export interface BudgetProfile {
  totalMonthlyBudget: number;
  currency: CurrencyConfig;
  selectedMonth: string; // YYYY-MM
}
