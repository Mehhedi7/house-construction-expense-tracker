'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface Expense {
  id: number;
  title: string;
  amount: number;
  created_at: string;
}

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // Load expenses on mount
  useEffect(() => {
    fetchExpenses();
  }, []);

  async function fetchExpenses() {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error('Fetch error:', error);
    else setExpenses(data as Expense[]);
  }

  async function addExpense(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !amount) return;
    setLoading(true);
    const { data, error } = await supabase.from('expenses').insert({
      title,
      amount: Number(amount),
    });
    if (error) console.error('Insert error:', error);
    else {
      setTitle('');
      setAmount('');
      fetchExpenses();
    }
    setLoading(false);
  }

  async function deleteExpense(id: number) {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) console.error('Delete error:', error);
    else fetchExpenses();
  }

  return (
    <main className="flex flex-col w-full max-w-2xl space-y-6">
      {/* Add expense form */}
      <form onSubmit={addExpense} className="flex space-x-2">
        <input
          type="text"
          placeholder="Expense title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 p-2 border rounded"
          required
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-32 p-2 border rounded"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? 'Adding...' : 'Add'}
        </button>
      </form>

      {/* Expense list */}
      <ul className="space-y-2">
        {expenses.map((exp) => (
          <li
            key={exp.id}
            className="flex justify-between items-center p-2 border rounded bg-white"
          >
            <span>
              {exp.title} – ${exp.amount}
            </span>
            <button
              onClick={() => deleteExpense(exp.id)}
              className="text-sm text-red-600 hover:underline"
            >
              Delete
            </button>
          </li>
        ))}
        {expenses.length === 0 && (
          <li className="text-gray-500">No expenses recorded yet.</li>
        )}
      </ul>
    </main>
  );
}
