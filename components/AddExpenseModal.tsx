'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PRESET_CATEGORIES } from '../lib/categories';
import { Expense } from '../lib/supabaseClient';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expenseData: {
    id?: string;
    amount: number;
    category: string;
    date: string;
    note: string;
  }) => Promise<void>;
  initialData?: Expense | null;
}

export default function AddExpenseModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: AddExpenseModalProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(PRESET_CATEGORIES[0].name);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const amountInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setAmount(String(initialData.amount));
        setCategory(initialData.category || PRESET_CATEGORIES[0].name);
        setDate(initialData.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0]);
        setNote(initialData.note || '');
      } else {
        setAmount('');
        setCategory(PRESET_CATEGORIES[3]?.name || PRESET_CATEGORIES[0].name); // 'Bricks & Masonry' default or first
        setDate(new Date().toISOString().split('T')[0]);
        setNote('');
      }
      setErrorMsg('');

      // Auto-focus amount input on desktop/modal open
      setTimeout(() => {
        amountInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('Please enter a valid amount greater than 0.');
      return;
    }

    if (!category) {
      setErrorMsg('Please select a category.');
      return;
    }

    if (!date) {
      setErrorMsg('Please select a valid date.');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        id: initialData?.id,
        amount: parsedAmount,
        category,
        date,
        note: note.trim(),
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save expense. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 animate-slide-up sm:animate-scale-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle bar */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-[#212121]">
              {initialData ? 'Edit Expense' : 'Add Construction Expense'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {initialData ? 'Update expense details' : 'Enter the expense amount and category'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition cursor-pointer"
            aria-label="Close modal"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Amount Field */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Amount (৳ Taka) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-xl font-bold text-[#166534]">
                ৳
              </div>
              <input
                ref={amountInputRef}
                type="number"
                step="any"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 text-lg font-semibold rounded-xl border border-gray-200 text-[#212121] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#166534] focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-[#212121] text-base focus:outline-none focus:ring-2 focus:ring-[#166534] focus:border-transparent transition appearance-none cursor-pointer"
              >
                {PRESET_CATEGORIES.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Date Field */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#212121] text-base focus:outline-none focus:ring-2 focus:ring-[#166534] focus:border-transparent transition"
            />
          </div>

          {/* Optional Note Field */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Note (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g., 500 bags of cement, truck transport fee, vendor name..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#212121] text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#166534] focus:border-transparent transition"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-5 py-3 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 active:scale-98 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl font-semibold text-white bg-[#166534] hover:bg-[#14532d] shadow-sm active:scale-98 transition disabled:opacity-60 flex items-center gap-2 cursor-pointer"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{initialData ? 'Update Expense' : 'Save Expense'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
