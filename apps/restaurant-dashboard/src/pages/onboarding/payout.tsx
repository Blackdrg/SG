import { useState } from 'react';
import { Button } from '@spicegarden/ui';
import Head from 'next/head';

export default function OnboardingPayout() {
  const [form, setForm] = useState({
    accountHolderName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    bankName: '',
    branchName: '',
  });
  const [loading, setLoading] = useState(false);
  const RESTAURANT_ID = 'demo-restaurant';

  const submit = async () => {
    if (form.accountNumber !== form.confirmAccountNumber) {
      alert('Account numbers do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/restaurant-onboarding/payout/${RESTAURANT_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountHolderName: form.accountHolderName,
          accountNumber: form.accountNumber,
          ifscCode: form.ifscCode,
          bankName: form.bankName,
          branchName: form.branchName,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      alert('Payout settings saved. Onboarding complete!');
    } catch (e) {
      alert('Failed to save payout details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: '24px' }}>
      <Head><title>Payout Settings - Onboarding</title></Head>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Payout Settings</h1>
        <p style={{ color: '#a1a1aa', marginBottom: 32 }}>Add your bank details to receive payouts.</p>

        <div style={{ background: '#171717', border: '1px solid #27272a', borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: '#a1a1aa', marginBottom: 8 }}>Your payouts will be sent to this account on a weekly basis.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: '#a1a1aa', marginBottom: 4 }}>Account Holder Name</label>
            <input
              aria-label="Account Holder Name"
              value={form.accountHolderName}
              onChange={(e) => setForm({ ...form, accountHolderName: e.target.value })}
              placeholder="As per bank records"
              style={{ width: '100%', padding: '10px 12px', background: '#171717', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 14 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: '#a1a1aa', marginBottom: 4 }}>Account Number</label>
            <input
              aria-label="Account Number"
              value={form.accountNumber}
              onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
              placeholder="Enter account number"
              type="password"
              style={{ width: '100%', padding: '10px 12px', background: '#171717', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 14 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: '#a1a1aa', marginBottom: 4 }}>Confirm Account Number</label>
            <input
              aria-label="Confirm Account Number"
              value={form.confirmAccountNumber}
              onChange={(e) => setForm({ ...form, confirmAccountNumber: e.target.value })}
              placeholder="Re-enter account number"
              type="password"
              style={{ width: '100%', padding: '10px 12px', background: '#171717', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 14 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: '#a1a1aa', marginBottom: 4 }}>IFSC Code</label>
            <input
              aria-label="IFSC Code"
              value={form.ifscCode}
              onChange={(e) => setForm({ ...form, ifscCode: e.target.value.toUpperCase() })}
              placeholder="SBIN0001234"
              maxLength={11}
              style={{ width: '100%', padding: '10px 12px', background: '#171717', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 14 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: '#a1a1aa', marginBottom: 4 }}>Bank Name</label>
            <input
              aria-label="Bank Name"
              value={form.bankName}
              onChange={(e) => setForm({ ...form, bankName: e.target.value })}
              placeholder="State Bank of India"
              style={{ width: '100%', padding: '10px 12px', background: '#171717', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 14 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: '#a1a1aa', marginBottom: 4 }}>Branch Name</label>
            <input
              aria-label="Branch Name"
              value={form.branchName}
              onChange={(e) => setForm({ ...form, branchName: e.target.value })}
              placeholder="Main Branch"
              style={{ width: '100%', padding: '10px 12px', background: '#171717', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 14 }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          <button
            onClick={() => window.location.href = '/onboarding/menu'}
            style={{ ...buttonStyle.secondary, flex: 1 }}
          >
            Back
          </button>
          <Button
            label={loading ? 'Submitting...' : 'Complete Onboarding'}
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
  primary: { padding: '10px 20px', background: '#f97316', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  secondary: { padding: '10px 20px', background: 'transparent', color: '#fff', border: '1px solid #333', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
};
