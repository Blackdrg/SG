import { useState } from 'react';
import { Button } from '@spicegarden/ui';
import Head from 'next/head';

export default function OnboardingMenu() {
  const [categories, setCategories] = useState<string[]>(['Main Course', 'Beverages']);
  const [items, setItems] = useState<{ name: string; price: string; category: string }[]>([]);
  const [newCat, setNewCat] = useState('');
  const [newItem, setNewItem] = useState({ name: '', price: '', category: categories[0] });
  const [loading, setLoading] = useState(false);

  const addCategory = () => {
    if (newCat.trim()) {
      setCategories([...categories, newCat.trim()]);
      setNewItem({ ...newItem, category: newCat.trim() });
      setNewCat('');
    }
  };

  const addItem = () => {
    if (newItem.name && newItem.price) {
      setItems([...items, { ...newItem, price: newItem.price }]);
      setNewItem({ ...newItem, name: '', price: '' });
    }
  };

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/restaurant-onboarding/step/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'MENU_SETUP',
          data: { categories, items },
        }),
      });
      if (!res.ok) throw new Error('Failed');
      alert('Menu saved');
    } catch (e) {
      alert('Failed to save menu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: '24px' }}>
      <Head><title>Menu Setup - Onboarding</title></Head>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Menu Setup</h1>
        <p style={{ color: '#a1a1aa', marginBottom: 32 }}>Create your menu categories and add items.</p>

        {/* Categories */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Categories</h2>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              aria-label="New category name"
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              placeholder="New category"
              style={{ flex: 1, padding: '8px 12px', background: '#171717', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 14 }}
            />
            <Button label="Add" onClick={addCategory} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <span key={cat} style={{ background: '#f9731620', border: '1px solid #f97316', padding: '4px 12px', borderRadius: 20, fontSize: 13 }}>
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Add Item */}
        <div style={{ background: '#171717', border: '1px solid #27272a', borderRadius: 8, padding: 20, marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Add Menu Item</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <input
              aria-label="Item name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              placeholder="Item name"
              style={{ padding: '8px 12px', background: '#0a0a0a', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 14 }}
            />
            <input
              aria-label="Item price"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              placeholder="Price (₹)"
              type="number"
              style={{ padding: '8px 12px', background: '#0a0a0a', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 14 }}
            />
            <select
              aria-label="Item category"
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              style={{ padding: '8px 12px', background: '#0a0a0a', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 14 }}
            >
              {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <Button label="Add Item" onClick={addItem} style={{ marginTop: 12 }} />
        </div>

        {/* Items List */}
        {items.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Menu Items ({items.length})</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map((item, idx) => (
                <div key={idx} style={{ background: '#171717', border: '1px solid #27272a', borderRadius: 6, padding: '10px 16px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{item.name}</span>
                  <span style={{ color: '#a1a1aa' }}>{item.category}</span>
                  <span style={{ color: '#f97316', fontWeight: 600 }}>₹{item.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => window.location.href = '/onboarding/gst'}
            style={{ ...buttonStyle.secondary, flex: 1 }}
          >
            Back
          </button>
          <Button label={loading ? 'Saving...' : 'Save Menu'} onClick={submit} disabled={loading} style={{ flex: 1 }} />
        </div>
      </div>
    </div>
  );
}

const buttonStyle = {
  primary: { padding: '10px 20px', background: '#f97316', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  secondary: { padding: '10px 20px', background: 'transparent', color: '#fff', border: '1px solid #333', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
};
