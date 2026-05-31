import { useState } from 'react';
import { Button } from '@spicegarden/ui';
import Head from 'next/head';

export default function OnboardingPricing() {
  const [form, setForm] = useState({
    deliveryFee: 40,
    packagingFee: 10,
    minimumOrder: 199,
    commissionRate: 12,
  });
  const [loading, setLoading] = useState(false);
  const RESTAURANT_ID = 'demo-restaurant';

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/restaurant-onboarding/pricing/${RESTAURANT_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      window.location.href = '/onboarding/payout';
    } catch (e) {
      alert('Failed to save pricing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: 24 }}>
      <Head><title>Pricing Setup - Onboarding</title></Head>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Pricing Setup</h1>
        <p style={{ color: '#a1a1aa', marginBottom: 32 }}>Configure your delivery fees and commission structure.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { key: 'deliveryFee', label: 'Delivery Fee (₹)', placeholder: '40' },
            { key: 'packagingFee', label: 'Packaging Fee (₹)', placeholder: '10' },
            { key: 'minimumOrder', label: 'Minimum Order (₹)', placeholder: '199' },
            { key: 'commissionRate', label: 'Commission Rate (%)', placeholder: '12' },
          ].map((field) => (
            <div key={field.key}>
              <label htmlFor={field.key} style={{ display: 'block', fontSize: 13, color: '#a1a1aa', marginBottom: 4 }}>{field.label}</label>
              <input
                id={field.key}
                aria-label={field.label}
                type="number"
                value={form[field.key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [field.key]: parseFloat(e.target.value) || 0 })}
                placeholder={field.placeholder}
                style={{ width: '100%', padding: '10px 12px', background: '#171717', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 14 }}
              />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          <button
            onClick={() => window.location.href = '/onboarding/menu'}
            style={{ ...buttonStyle.secondary, flex: 1 }}
          >
            Back
          </button>
          <Button label={loading ? 'Saving...' : 'Continue'} onClick={submit} disabled={loading} style={{ flex: 1 }} />
        </div>
      </div>
    </div>
  );
}

const buttonStyle = {
  primary: { padding: '10px 20px', background: '#f97316', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  secondary: { padding: '10px 20px', background: 'transparent', color: '#fff', border: '1px solid #333', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
};
