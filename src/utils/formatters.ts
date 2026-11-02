import { Category, CurrencyConfig, Transaction } from '../types/budget';

export function formatCurrency(amount: number, currency: CurrencyConfig): string {
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs);

  return `${isNegative ? '-' : ''}${currency.symbol}${formatted}`;
}

export function formatMonthName(monthStr: string): string {
  if (!monthStr || !monthStr.includes('-')) return monthStr;
  const [year, month] = monthStr.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function formatDatePretty(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  if (dateStr === todayStr) return 'Today';
  if (dateStr === yesterdayStr) return 'Yesterday';

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getDaysRemainingInMonth(monthStr: string): { daysLeft: number; totalDays: number; currentDay: number } {
  const [year, month] = monthStr.split('-').map(Number);
  const lastDayOfMonth = new Date(year, month, 0).getDate();
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  if (year === currentYear && month === currentMonth) {
    const daysLeft = Math.max(1, lastDayOfMonth - currentDay + 1);
    return { daysLeft, totalDays: lastDayOfMonth, currentDay };
  } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
    // Past month
    return { daysLeft: 0, totalDays: lastDayOfMonth, currentDay: lastDayOfMonth };
  } else {
    // Future month
    return { daysLeft: lastDayOfMonth, totalDays: lastDayOfMonth, currentDay: 1 };
  }
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportTransactionsToCSV(
  transactions: Transaction[],
  categories: Category[],
  currency: CurrencyConfig
): void {
  const categoryMap = new Map(categories.map(c => [c.id, c.name]));
  const headers = ['ID', 'Date', 'Type', 'Category', 'Description', 'Amount', 'Currency', 'Payment Method', 'Notes'];
  
  const rows = transactions.map(tx => [
    `"${tx.id}"`,
    `"${tx.date}"`,
    `"${tx.type}"`,
    `"${categoryMap.get(tx.categoryId) || 'Uncategorized'}"`,
    `"${tx.description.replace(/"/g, '""')}"`,
    tx.amount.toFixed(2),
    `"${currency.code}"`,
    `"${tx.paymentMethod}"`,
    `"${(tx.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const filename = `budgetpulse-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
}
