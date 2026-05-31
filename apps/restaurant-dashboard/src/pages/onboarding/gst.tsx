import { useState } from 'react';
import { Button } from '@spicegarden/ui';
import Head from 'next/head';

export default function OnboardingGST() {
  const [form, setForm] = useState({
    gstin: '',
    legalName: '',
    tradeName: '',
    address: '',
    state: '',
    stateCode: '',
  });
  const [loading, setLoading] = useState(false);
  const RESTAURANT_ID = 'demo-restaurant';

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/restaurant-onboarding/gst/${RESTAURANT_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      alert('GST configuration saved');
    } catch (e) {
      alert('Failed to save GST details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: '24px' }}>
      <Head><title>GST Configuration - Onboarding</title></Head>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>GST Configuration</h1>
        <p style={{ color: '#a1a1aa', marginBottom: 32 }}>Configure your GST details for billing and compliance.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {(['gstin', 'legalName', 'tradeName', 'address', 'state'] as const).map((field) => (
            <div key={field}>
              <label style={{ display: 'block', fontSize: 13, color: '#a1a1aa', marginBottom: 4 }}>{field.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</label>
              <input
                aria-label={field}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                placeholder={`Enter ${field}`}
                style={{ width: '100%', padding: '10px 12px', background: '#171717', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 14 }}
              />
            </div>
          ))}
          <div>
            <label style={{ display: 'block', fontSize: 13, color: '#a1a1aa', marginBottom: 4 }}>State Code</label>
            <input
              aria-label="State Code"
              value={form.stateCode}
              onChange={(e) => setForm({ ...form, stateCode: e.target.value })}
              placeholder="27"
              maxLength={2}
              style={{ width: '100%', padding: '10px 12px', background: '#171717', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 14 }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          <button
            onClick={() => window.location.href = '/onboarding/documents'}
            style={{ ...buttonStyle.secondary, flex: 1 }}
          >
            Back
          </button>
          <Button
            label={loading ? 'Saving...' : 'Continue'}
            onClick={submit}
            disabled={loading}
            style={{ flex: 1 }}
          />
        </div>
      </div>
    </div>
  );
}

const buttonStyle = {
  primary: {
    padding: '10px 20px',
    background: '#f97316',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
  },
  secondary: {
    padding: '10px 20px',
    background: 'transparent',
    color: '#fff',
    border: '1px solid #333',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
  },
};
