export interface CategoryItem {
  name: string;
  icon: string;
  badgeBg: string;
  badgeText: string;
}

export const PRESET_CATEGORIES: CategoryItem[] = [
  { name: 'Land & Registration', icon: '🏞️', badgeBg: 'bg-emerald-50', badgeText: 'text-emerald-800' },
  { name: 'Design & Approval', icon: '📋', badgeBg: 'bg-blue-50', badgeText: 'text-blue-800' },
  { name: 'Foundation', icon: '🏗️', badgeBg: 'bg-amber-50', badgeText: 'text-amber-800' },
  { name: 'Bricks & Masonry', icon: '🧱', badgeBg: 'bg-orange-50', badgeText: 'text-orange-800' },
  { name: 'Cement & Sand', icon: '⏳', badgeBg: 'bg-yellow-50', badgeText: 'text-yellow-800' },
  { name: 'Rod & Steel', icon: '🔩', badgeBg: 'bg-slate-100', badgeText: 'text-slate-800' },
  { name: 'Labor Wages', icon: '👷‍♂️', badgeBg: 'bg-cyan-50', badgeText: 'text-cyan-800' },
  { name: 'Electrical', icon: '⚡', badgeBg: 'bg-amber-50', badgeText: 'text-amber-800' },
  { name: 'Plumbing & Sanitary', icon: '🚿', badgeBg: 'bg-sky-50', badgeText: 'text-sky-800' },
  { name: 'Tiles & Flooring', icon: '🪵', badgeBg: 'bg-stone-100', badgeText: 'text-stone-800' },
  { name: 'Doors & Windows', icon: '🚪', badgeBg: 'bg-rose-50', badgeText: 'text-rose-800' },
  { name: 'Paint & Finish', icon: '🎨', badgeBg: 'bg-purple-50', badgeText: 'text-purple-800' },
  { name: 'Furniture & Fixtures', icon: '🛋️', badgeBg: 'bg-indigo-50', badgeText: 'text-indigo-800' },
  { name: 'Transport', icon: '🚚', badgeBg: 'bg-teal-50', badgeText: 'text-teal-800' },
  { name: 'Miscellaneous', icon: '📦', badgeBg: 'bg-gray-100', badgeText: 'text-gray-800' },
];

export function getCategoryMeta(name: string): CategoryItem {
  const match = PRESET_CATEGORIES.find(
    (c) => c.name.toLowerCase() === (name || '').trim().toLowerCase()
  );
  return (
    match || {
      name: name || 'Miscellaneous',
      icon: '📦',
      badgeBg: 'bg-gray-100',
      badgeText: 'text-gray-800',
    }
  );
}

/**
 * Formats an amount in Bangladeshi Taka like "৳ 0.00" or "৳ 1,250,000.00"
 */
export function formatTaka(amount: number): string {
  let numericAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  if (Object.is(numericAmount, -0) || numericAmount === 0) {
    numericAmount = 0;
  }
  return `৳ ${numericAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Formats a date string (YYYY-MM-DD) into UK style "15 Oct 2024" without timezone shift
 */
export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const dateOnly = dateStr.split('T')[0];
  const parts = dateOnly.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
  }
  return dateStr;
}
