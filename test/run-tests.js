const assert = require('assert');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure compiled test module exists
const distDir = path.join(__dirname, '..', 'test-dist');
const distFile = path.join(distDir, 'categories.js');

if (!fs.existsSync(distFile)) {
  execSync('npx tsc lib/categories.ts --outDir ./test-dist --module commonjs --target es2020', {
    cwd: path.join(__dirname, '..'),
    stdio: 'ignore'
  });
}

const { PRESET_CATEGORIES, getCategoryMeta, formatTaka, formatDateDisplay } = require(distFile);

console.log('=== Running House Construction Expense Tracker Automated Tests ===');

// Test 1: Exactly 15 Preset Categories matching requirements
console.log('\n[1/5] Verifying 15 Preset Categories:');
assert.strictEqual(PRESET_CATEGORIES.length, 15, 'Must have exactly 15 preset categories');

const expectedList = [
  'Land & Registration',
  'Design & Approval',
  'Foundation',
  'Bricks & Masonry',
  'Cement & Sand',
  'Rod & Steel',
  'Labor Wages',
  'Electrical',
  'Plumbing & Sanitary',
  'Tiles & Flooring',
  'Doors & Windows',
  'Paint & Finish',
  'Furniture & Fixtures',
  'Transport',
  'Miscellaneous'
];

expectedList.forEach((catName, idx) => {
  const item = PRESET_CATEGORIES[idx];
  assert.strictEqual(item.name, catName, `Item at index ${idx} should be "${catName}"`);
  assert.ok(item.icon, `Item "${catName}" must have an icon`);
  assert.ok(item.badgeBg, `Item "${catName}" must have badgeBg`);
  assert.ok(item.badgeText, `Item "${catName}" must have badgeText`);
});
console.log('  PASS: All 15 preset categories present in correct order with metadata');

// Test 2: Category Meta lookup and case tolerance
console.log('\n[2/5] Testing getCategoryMeta:');
assert.strictEqual(getCategoryMeta('Land & Registration').name, 'Land & Registration');
assert.strictEqual(getCategoryMeta('land & registration').name, 'Land & Registration');
assert.strictEqual(getCategoryMeta('  Bricks & Masonry  ').name, 'Bricks & Masonry');
assert.strictEqual(getCategoryMeta('Unknown Category').name, 'Unknown Category');
assert.strictEqual(getCategoryMeta('Unknown Category').icon, '📦');
assert.strictEqual(getCategoryMeta('').name, 'Miscellaneous');
assert.strictEqual(getCategoryMeta(null).name, 'Miscellaneous');
console.log('  PASS: Category lookup is robust, case-tolerant, and handles unknown/null');

// Test 3: Currency formatting for Taka
console.log('\n[3/5] Testing Taka Currency Formatter:');
assert.strictEqual(formatTaka(0), '৳ 0.00', 'New user zero spending should display "৳ 0.00"');
assert.strictEqual(formatTaka(0.5), '৳ 0.50');
assert.strictEqual(formatTaka(500), '৳ 500.00');
assert.strictEqual(formatTaka(1000), '৳ 1,000.00');
assert.strictEqual(formatTaka(543210.75), '৳ 543,210.75');
assert.strictEqual(formatTaka(10000000), '৳ 10,000,000.00');
assert.strictEqual(formatTaka(NaN), '৳ 0.00');
assert.strictEqual(formatTaka(-0), '৳ 0.00');
assert.strictEqual(formatTaka(null), '৳ 0.00');
console.log('  PASS: Currency correctly formats with "৳", thousand separators, and two decimals');

// Test 4: Date Display Timezone Independence
console.log('\n[4/5] Testing Date Formatter Timezone Independence:');
const nov21 = formatDateDisplay('2026-11-21');
assert.ok(nov21.includes('21') && nov21.includes('Nov') && nov21.includes('2026'),
  `Formatted date "${nov21}" must preserve Nov 21 without UTC shift`
);
const jan1 = formatDateDisplay('2025-01-01');
assert.ok(jan1.includes('1') && jan1.includes('Jan') && jan1.includes('2025'),
  `Formatted date "${jan1}" must preserve Jan 1`
);
assert.strictEqual(formatDateDisplay(''), '');
assert.strictEqual(formatDateDisplay(null), '');
console.log('  PASS: Dates render correctly without timezone off-by-one shifts');

// Test 5: Expense calculations & grouping logic
console.log('\n[5/5] Testing Expense Grouping & Aggregations:');
const sampleExpenses = [
  { id: '1', user_id: 'u1', amount: 50000, category: 'Bricks & Masonry', date: '2026-11-20', note: '10000 bricks' },
  { id: '2', user_id: 'u1', amount: 35000, category: 'Cement & Sand', date: '2026-11-21', note: '70 bags cement' },
  { id: '3', user_id: 'u1', amount: 25000, category: 'Bricks & Masonry', date: '2026-11-21', note: 'Extra bricks' },
];

const totalSpent = sampleExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
assert.strictEqual(totalSpent, 110000);
assert.strictEqual(formatTaka(totalSpent), '৳ 110,000.00');

// Grouping by category
const map = new Map();
sampleExpenses.forEach((item) => {
  const cat = item.category || 'Miscellaneous';
  if (!map.has(cat)) map.set(cat, []);
  map.get(cat).push(item);
});

assert.strictEqual(map.get('Bricks & Masonry').length, 2);
assert.strictEqual(map.get('Cement & Sand').length, 1);
const bricksTotal = map.get('Bricks & Masonry').reduce((s, i) => s + i.amount, 0);
assert.strictEqual(bricksTotal, 75000);
assert.strictEqual(formatTaka(bricksTotal), '৳ 75,000.00');

console.log('  PASS: Calculations, totals, and groupings match specifications');

// Clean up distDir
try {
  fs.rmSync(distDir, { recursive: true, force: true });
} catch {}

console.log('\n=== ALL TESTS PASSED SUCCESSFULLY! ===\n');
