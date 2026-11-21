'use client';

import React, { useState } from 'react';
import { Expense } from '../lib/supabaseClient';
import { formatTaka } from '../lib/categories';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  expense: Expense | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function DeleteConfirmModal({
  isOpen,
  expense,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  const [deleting, setDeleting] = useState(false);

  if (!isOpen || !expense) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-xl mb-4 mx-auto">
          🗑️
        </div>

        <h3 className="text-lg font-bold text-center text-[#212121]">
          Delete Expense?
        </h3>

        <p className="text-sm text-gray-500 text-center mt-2">
          Are you sure you want to delete this expense of{' '}
          <strong className="text-gray-800">{formatTaka(expense.amount)}</strong> for{' '}
          <span className="font-medium text-gray-800">{expense.category}</span>? This action cannot be undone.
        </p>

        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="flex-1 py-2.5 px-4 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm transition disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
          >
            {deleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
