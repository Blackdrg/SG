import { useState } from 'react';
import { Button } from '@spicegarden/ui';
import Head from 'next/head';

export default function OnboardingBusiness() {
  const [form, setForm] = useState({
    legalName: '',
    tradeName: '',
    gstin: '',
    businessType: 'sole_proprietorship',
    registrationDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const RESTAURANT_ID = 'demo-restaurant';

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/restaurant-onboarding/step/${RESTAURANT_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'BUSINESS_REGISTRATION',
          data: form,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      alert('Business info submitted');
    } catch (e) {
      setError('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: '24px' }}>
      <Head><title>Business Registration - Onboarding</title></Head>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Business Registration</h1>
        <p style={{ color: '#a1a1aa', marginBottom: 32 }}>Enter your business details to get started.</p>

        {error && <div style={{ background: '#3f1212', border: '1px solid #f04e31', padding: 12, borderRadius: 8, marginBottom: 16, color: '#fca5a5' }}>{error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: '#a1a1aa', marginBottom: 4 }}>Legal Business Name</label>
            <input
              aria-label="Legal Business Name"
              value={form.legalName}
              onChange={(e) => setForm({ ...form, legalName: e.target.value })}
              placeholder="ABC Foods Pvt Ltd"
              style={{ width: '100%', padding: '10px 12px', background: '#171717', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 14 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: '#a1a1aa', marginBottom: 4 }}>Trade Name</label>
            <input
              aria-label="Trade Name"
              value={form.tradeName}
              onChange={(e) => setForm({ ...form, tradeName: e.target.value })}
              placeholder="Spice Garden"
              style={{ width: '100%', padding: '10px 12px', background: '#171717', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 14 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: '#a1a1aa', marginBottom: 4 }}>GSTIN</label>
            <input
              aria-label="GSTIN"
              value={form.gstin}
              onChange={(e) => setForm({ ...form, gstin: e.target.value })}
              placeholder="27AADCB2230M1ZT"
              style={{ width: '100%', padding: '10px 12px', background: '#171717', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 14 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: '#a1a1aa', marginBottom: 4 }}>Business Type</label>
            <select
              aria-label="Business Type"
              value={form.businessType}
              onChange={(e) => setForm({ ...form, businessType: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', background: '#171717', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 14 }}
            >
              <option value="sole_proprietorship">Sole Proprietorship</option>
              <option value="partnership">Partnership</option>
              <option value="llp">LLP</option>
              <option value="private_limited">Private Limited</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: '#a1a1aa', marginBottom: 4 }}>Registration Date</label>
            <input
              aria-label="Registration Date"
              type="date"
              value={form.registrationDate}
              onChange={(e) => setForm({ ...form, registrationDate: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', background: '#171717', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 14 }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          <button
            onClick={() => window.location.href = '/onboarding'}
            style={{ ...buttonStyle.secondary, flex: 1 }}
          >
            Back
          </button>
          <Button
            label={loading ? 'Submitting...' : 'Continue'}
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
