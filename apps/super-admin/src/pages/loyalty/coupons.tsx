import { useState } from 'react';
import Head from 'next/head';

const API = 'http://localhost:3001/api';

export default function LoyaltyCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ code: '', type: 'percentage', discountValue: '', usageLimit: '' });
  const [loading, setLoading] = useState(true);

  useState(() => {
    fetch(`${API}/loyalty/coupons`)
      .then((r) => r.json())
      .then((data) => { setCoupons(data); setLoading(false); })
      .catch(() => setLoading(false));
  });

  const createCoupon = async () => {
    setCreating(true);
    await fetch(`${API}/loyalty/coupons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, discountValue: parseFloat(form.discountValue), usageLimit: parseInt(form.usageLimit), validFrom: new Date(), validUntil: new Date(Date.now() + 30 * 86400000) }),
    });
    setForm({ code: '', type: 'percentage', discountValue: '', usageLimit: '' });
    setCreating(false);
    alert('Coupon created');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: 24 }}>
      <Head><title>Coupon Management - SpiceGarden</title></Head>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Coupon Management</h1>

      <div style={{ background: '#171717', border: '1px solid #27272a', borderRadius: 8, padding: 20, maxWidth: 600, marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Create New Coupon</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            id="coupon-code"
            aria-label="Coupon code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="Coupon code (e.g. SAVE20)"
            style={{ padding: '8px 12px', background: '#0a0a0a', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 14 }}
          />
          <select
            id="coupon-type"
            aria-label="Coupon type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            style={{ padding: '8px 12px', background: '#0a0a0a', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 14 }}
          >
            <option value="percentage">Percentage</option>
            <option value="fixed_amount">Fixed Amount</option>
            <option value="free_delivery">Free Delivery</option>
          </select>
          <input
            id="discount-value"
            aria-label="Discount value"
            value={form.discountValue}
            onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
            placeholder="Discount value"
            type="number"
            style={{ padding: '8px 12px', background: '#0a0a0a', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 14 }}
          />
          <input
            id="usage-limit"
            aria-label="Usage limit"
            value={form.usageLimit}
            onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
            placeholder="Usage limit"
            type="number"
            style={{ padding: '8px 12px', background: '#0a0a0a', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 14 }}
          />
          <button
            onClick={createCoupon}
            disabled={creating}
            style={{ padding: '10px 20px', background: '#f97316', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
          >
            {creating ? 'Creating...' : 'Create Coupon'}
          </button>
        </div>
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Active Coupons ({coupons.length})</h2>
      {loading ? (
        <p style={{ color: '#71717a' }}>Loading...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {coupons.filter((c: any) => c.status === 'active').map((c: any) => (
            <div key={c.id} style={{ background: '#171717', border: '1px solid #27272a', borderRadius: 6, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 600, color: '#f97316' }}>{c.code}</span>
                <span style={{ color: '#a1a1aa', marginLeft: 12, fontSize: 13 }}>{c.type} · Used {c.usageCount}/{c.usageLimit}</span>
              </div>
              <span style={{ fontSize: 12, color: '#4ade80' }}>Active</span>
            </div>
          ))}
          {coupons.filter((c: any) => c.status === 'active').length === 0 && (
            <p style={{ color: '#71717a', fontSize: 13 }}>No active coupons</p>
          )}
        </div>
      )}
      <a href="/loyalty" style={{ color: '#f97316', textDecoration: 'none', marginTop: 16, display: 'inline-block' }}>← Back</a>
    </div>
  );
}
