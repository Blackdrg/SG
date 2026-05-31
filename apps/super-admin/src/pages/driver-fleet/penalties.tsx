import { useState } from 'react';

const API = 'http://localhost:3001/api';

export default function DriverFleetPenalties() {
  const [form, setForm] = useState({ driverId: '', type: 'late_pickup', amount: '', description: '' });
  const [submitted, setSubmitted] = useState(false);

  const issuePenalty = async () => {
    await fetch(`${API}/fleet/penalties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
    });
    setSubmitted(true);
    setForm({ driverId: '', type: 'late_pickup', amount: '', description: '' });
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Penalty Management</h1>

      <div style={{ background: '#171717', border: '1px solid #27272a', borderRadius: 8, padding: 20, maxWidth: 600 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Issue New Penalty</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            aria-label="Driver ID"
            value={form.driverId}
            onChange={(e) => setForm({ ...form, driverId: e.target.value })}
            placeholder="Driver ID"
            style={{ padding: '8px 12px', background: '#0a0a0a', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 14 }}
          />
          <select
            aria-label="Penalty type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            style={{ padding: '8px 12px', background: '#0a0a0a', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 14 }}
          >
            <option value="late_pickup">Late Pickup</option>
            <option value="late_delivery">Late Delivery</option>
            <option value="cancellation">Cancellation</option>
            <option value="route_deviation">Route Deviation</option>
          </select>
          <input
            aria-label="Penalty amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="Amount (₹)"
            type="number"
            style={{ padding: '8px 12px', background: '#0a0a0a', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 14 }}
          />
          <textarea
            aria-label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Reason for penalty"
            rows={3}
            style={{ padding: '8px 12px', background: '#0a0a0a', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 14 }}
          />
          <button
            onClick={issuePenalty}
            style={{ padding: '10px 20px', background: '#f04e31', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
          >
            Issue Penalty
          </button>
          {submitted && <p style={{ color: '#4ade80', fontSize: 13 }}>Penalty issued successfully</p>}
        </div>
      </div>

      <a href="/driver-fleet" style={{ color: '#f97316', textDecoration: 'none', marginTop: 16, display: 'inline-block' }}>← Back to Fleet</a>
    </div>
  );
}
