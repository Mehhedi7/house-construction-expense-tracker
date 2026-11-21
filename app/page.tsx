'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured, Expense } from '../lib/supabaseClient';
import { formatTaka, getCategoryMeta } from '../lib/categories';
import AddExpenseModal from '../components/AddExpenseModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

interface CategoryGroup {
  name: string;
  icon: string;
  badgeBg: string;
  badgeText: string;
  total: number;
  items: Expense[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Authentication check & session protection
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (!session) {
        router.replace('/login');
      } else {
        setUser(session.user);
        setLoadingSession(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (!session) {
        setUser(null);
        router.replace('/login');
      } else {
        setUser(session.user);
        setLoadingSession(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  // Fetch expenses for current user
  const fetchExpenses = useCallback(async (userId: string) => {
    setLoadingExpenses(true);
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching expenses:', error);
      } else if (data) {
        setExpenses(data as Expense[]);
        // Expand all categories by default on first load
        const initialExpanded: Record<string, boolean> = {};
        data.forEach((exp: Expense) => {
          if (exp.category) {
            initialExpanded[exp.category] = true;
          }
        });
        setExpandedCategories(initialExpanded);
      }
    } catch (err) {
      console.error('Fetch exception:', err);
    } finally {
      setLoadingExpenses(false);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchExpenses(user.id);
    }
  }, [user?.id, fetchExpenses]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace('/login');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // Toggle category accordion
  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  };

  // Calculate total spent
  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [expenses]);

  // Group expenses by category
  const categoryGroups = useMemo(() => {
    const map = new Map<string, Expense[]>();

    expenses.forEach((item) => {
      const cat = item.category || 'Miscellaneous';
      if (!map.has(cat)) {
        map.set(cat, []);
      }
      map.get(cat)!.push(item);
    });

    const groups: CategoryGroup[] = [];
    map.forEach((items, catName) => {
      const meta = getCategoryMeta(catName);
      const total = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
      // Sort items by date desc, then created_at desc
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      groups.push({
        name: catName,
        icon: meta.icon,
        badgeBg: meta.badgeBg,
        badgeText: meta.badgeText,
        total,
        items,
      });
    });

    // Sort categories by highest total spent first
    groups.sort((a, b) => b.total - a.total);
    return groups;
  }, [expenses]);

  // Save (Create or Update) Expense handler
  const handleSaveExpense = async (data: {
    id?: string;
    amount: number;
    category: string;
    date: string;
    note: string;
  }) => {
    if (!user?.id) throw new Error('User is not authenticated');

    if (data.id) {
      // Update existing expense
      const { data: updated, error } = await supabase
        .from('expenses')
        .update({
          amount: data.amount,
          category: data.category,
          date: data.date,
          note: data.note || null,
        })
        .eq('id', data.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Update state instantly without page reload
      setExpenses((prev) =>
        prev.map((item) =>
          item.id === data.id
            ? {
                ...item,
                amount: data.amount,
                category: data.category,
                date: data.date,
                note: data.note || null,
                ...(updated || {}),
              }
            : item
        )
      );
    } else {
      // Insert new expense
      const { data: inserted, error } = await supabase
        .from('expenses')
        .insert({
          user_id: user.id,
          amount: data.amount,
          category: data.category,
          date: data.date,
          note: data.note || null,
        })
        .select()
        .single();

      if (error) throw error;

      const newExpense: Expense = inserted || {
        id: crypto.randomUUID?.() || String(Date.now()),
        user_id: user.id,
        amount: data.amount,
        category: data.category,
        date: data.date,
        note: data.note || null,
        created_at: new Date().toISOString(),
      };

      // Prepend to expenses list instantly
      setExpenses((prev) => [newExpense, ...prev]);

      // Ensure newly added category is expanded
      setExpandedCategories((prev) => ({
        ...prev,
        [data.category]: true,
      }));
    }
  };

  // Delete Expense handler
  const handleConfirmDelete = async () => {
    if (!deletingExpense || !user?.id) return;

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', deletingExpense.id)
      .eq('user_id', user.id);

    if (error) {
      alert(`Could not delete expense: ${error.message}`);
      return;
    }

    // Instantly remove from state without page reload
    setExpenses((prev) => prev.filter((item) => item.id !== deletingExpense.id));
  };

  // Date formatting helper
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-emerald-200 border-t-[#166534] rounded-full animate-spin" />
          <span className="text-sm text-gray-500 font-medium">Loading session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#212121] pb-28">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl" role="img" aria-label="House">
              🏠
            </span>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-[#212121] leading-tight">
                Construction Tracker
              </h1>
              {user?.email && (
                <p className="text-xs text-gray-400 truncate max-w-[180px] sm:max-w-xs">
                  {user.email}
                </p>
              )}
            </div>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-100 transition cursor-pointer"
            title="Log out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">
        {/* Supabase Configuration Warning Banner if applicable */}
        {!isSupabaseConfigured && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
            <p className="font-bold flex items-center gap-2">
              <span>⚠️</span> Supabase Environment Variables Missing
            </p>
            <p className="text-xs mt-1 text-amber-800">
              Please add <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
              <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your Vercel project settings to enable database operations.
            </p>
          </div>
        )}

        {/* Hero Card: Total Spent */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-gray-100 mb-6 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Total Spent
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-[#166534] border border-emerald-100">
              BDT (৳)
            </span>
          </div>

          <div className="text-4xl sm:text-5xl font-black text-[#212121] tracking-tight py-1">
            {formatTaka(totalSpent)}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs sm:text-sm text-gray-500">
            <span>
              {categoryGroups.length} {categoryGroups.length === 1 ? 'Category' : 'Categories'}
            </span>
            <span>
              {expenses.length} {expenses.length === 1 ? 'Expense Entry' : 'Total Entries'}
            </span>
          </div>
        </section>

        {/* Expenses List Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-bold text-gray-800 uppercase tracking-wide text-xs">
              Expenses by Category
            </h2>
            {expenses.length > 0 && (
              <span className="text-xs text-gray-400">
                Tap category to expand / collapse
              </span>
            )}
          </div>

          {/* Loading state indicator */}
          {loadingExpenses && expenses.length === 0 && (
            <div className="bg-white rounded-2xl p-8 shadow-soft border border-gray-100 flex flex-col items-center justify-center gap-2">
              <div className="w-7 h-7 border-3 border-emerald-200 border-t-[#166534] rounded-full animate-spin" />
              <p className="text-xs text-gray-400">Loading your construction expenses...</p>
            </div>
          )}

          {/* Empty State */}
          {!loadingExpenses && expenses.length === 0 && (
            <div className="bg-white rounded-3xl p-10 sm:p-12 shadow-soft border border-gray-100 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-3xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                🧱
              </div>
              <h3 className="text-lg font-bold text-gray-800">
                No expenses yet
              </h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1 mb-6">
                Tap + to add your first one.
              </p>
              <button
                type="button"
                onClick={() => {
                  setEditingExpense(null);
                  setIsAddModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-[#166534] hover:bg-[#14532d] shadow-sm active:scale-98 transition cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                <span>Add First Expense</span>
              </button>
            </div>
          )}

          {/* Grouped Category Cards Accordion */}
          {categoryGroups.map((group) => {
            const isExpanded = expandedCategories[group.name] ?? false;

            return (
              <div
                key={group.name}
                className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden transition-all duration-200"
              >
                {/* Category Header Row (Clickable) */}
                <button
                  type="button"
                  onClick={() => toggleCategory(group.name)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-gray-50/70 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${group.badgeBg}`}
                    >
                      {group.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm sm:text-base truncate">
                          {group.name}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 shrink-0">
                          {group.items.length}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {group.items.length === 1 ? '1 entry' : `${group.items.length} entries`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    <div className="text-right">
                      <span className="text-sm sm:text-base font-extrabold text-[#166534]">
                        {formatTaka(group.total)}
                      </span>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-gray-400 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : 'rotate-0'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* Expanded Individual Entries List */}
                {isExpanded && (
                  <div className="border-t border-gray-100 divide-y divide-gray-50 bg-gray-50/30">
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 sm:px-6 flex items-center justify-between gap-3 hover:bg-white transition"
                      >
                        {/* Entry info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                            <span>📅 {formatDateDisplay(item.date)}</span>
                          </div>
                          {item.note ? (
                            <p className="text-sm text-gray-800 mt-0.5 line-clamp-2">
                              {item.note}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-400 italic mt-0.5">
                              No note provided
                            </p>
                          )}
                        </div>

                        {/* Amount & Actions */}
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-sm sm:text-base font-bold text-gray-900">
                            {formatTaka(item.amount)}
                          </span>

                          <div className="flex items-center gap-1">
                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingExpense(item);
                                setIsAddModalOpen(true);
                              }}
                              className="w-8 h-8 rounded-lg text-gray-400 hover:text-[#166534] hover:bg-emerald-50 flex items-center justify-center transition cursor-pointer"
                              title="Edit expense"
                              aria-label="Edit expense"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                />
                              </svg>
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingExpense(item);
                                setIsDeleteModalOpen(true);
                              }}
                              className="w-8 h-8 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition cursor-pointer"
                              title="Delete expense"
                              aria-label="Delete expense"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </main>

      {/* Floating Action Button (+) */}
      <button
        type="button"
        onClick={() => {
          setEditingExpense(null);
          setIsAddModalOpen(true);
        }}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#166534] hover:bg-[#14532d] text-white shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-emerald-200 cursor-pointer"
        aria-label="Add expense"
        title="Add new expense"
      >
        <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Add / Edit Expense Modal */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        initialData={editingExpense}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        expense={deletingExpense}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingExpense(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
