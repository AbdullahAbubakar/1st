import React, { useRef, useState } from 'react';
import { Category, CurrencyConfig, Transaction } from '../types/budget';
import { downloadFile, exportTransactionsToCSV } from '../utils/formatters';
import { X, Download, Upload, RefreshCw, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  categories: Category[];
  currency: CurrencyConfig;
  onImportData: (imported: { transactions: Transaction[]; categories?: Category[] }) => void;
  onResetDemoData: () => void;
  onClearAllData: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  categories,
  currency,
  onImportData,
  onResetDemoData,
  onClearAllData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      currency,
      categories,
      transactions,
    };
    downloadFile(
      JSON.stringify(data, null, 2),
      `budgetpulse-backup-${new Date().toISOString().slice(0, 10)}.json`,
      'application/json'
    );
    setStatusMessage({ text: 'Backup exported successfully!', type: 'success' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (!Array.isArray(parsed.transactions)) {
          throw new Error('Invalid backup file structure: missing transactions array.');
        }

        onImportData({
          transactions: parsed.transactions,
          categories: Array.isArray(parsed.categories) ? parsed.categories : undefined,
        });

        setStatusMessage({
          text: `Imported ${parsed.transactions.length} transactions successfully!`,
          type: 'success',
        });
      } catch (err: any) {
        setStatusMessage({
          text: err.message || 'Failed to read JSON backup file.',
          type: 'error',
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="data-mgmt-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h2 id="data-mgmt-title" className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Data Management & Backup
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Export, import, or manage your stored records
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

        <div className="p-6 space-y-4">
          {statusMessage && (
            <div
              className={`p-3 text-xs rounded-xl flex items-center gap-2 border ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 size={15} className="shrink-0" />
              ) : (
                <AlertTriangle size={15} className="shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Export Options */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
              Export
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => exportTransactionsToCSV(transactions, categories, currency)}
                className="flex items-center justify-center gap-2 p-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700/60 transition-colors"
              >
                <Download size={14} />
                <span>Export CSV</span>
              </button>
              <button
                onClick={handleExportJSON}
                className="flex items-center justify-center gap-2 p-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700/60 transition-colors"
              >
                <Download size={14} />
                <span>Backup JSON</span>
              </button>
            </div>
          </div>

          {/* Import Option */}
          <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
              Restore & Import
            </h3>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 p-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700/60 transition-colors"
            >
              <Upload size={14} />
              <span>Select JSON Backup File</span>
            </button>
          </div>

          {/* Reset or Clear */}
          <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
              Maintenance
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  onResetDemoData();
                  setStatusMessage({ text: 'Reset to realistic sample data!', type: 'success' });
                }}
                className="w-full flex items-center justify-center gap-2 p-2.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 rounded-xl transition-colors"
              >
                <RefreshCw size={13} />
                <span>Load Sample Data</span>
              </button>

              {showClearConfirm ? (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl space-y-2">
                  <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">
                    Are you sure? This deletes all your logged transactions.
                  </p>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="px-2.5 py-1 text-xs text-neutral-600 dark:text-neutral-400 hover:underline"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        onClearAllData();
                        setShowClearConfirm(false);
                        setStatusMessage({ text: 'All transaction records cleared.', type: 'success' });
                      }}
                      className="px-3 py-1 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
                    >
                      Yes, Clear All
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 p-2.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-colors"
                >
                  <Trash2 size={13} />
                  <span>Clear All Transactions</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
