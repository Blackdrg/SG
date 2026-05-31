import { useState, useEffect } from 'react';
import Head from 'next/head';

const API = 'http://localhost:3001/api';

export default function LoyaltyReferrals() {
  const [history, setHistory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/loyalty/referrals/demo-user`)
      .then((r) => r.json())
      .then((data) => { setHistory(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: 24 }}>
      <Head><title>Referral Management - SpiceGarden</title></Head>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Referral Management</h1>

      {loading ? (
        <p style={{ color: '#71717a' }}>Loading...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total Sent', value: history?.totalSent || 0 },
            { label: 'Completed', value: history?.totalCompleted || 0 },
            { label: 'Total Earned', value: `₹${history?.totalEarned || 0}` },
          ].map((card) => (
            <div key={card.label} style={{ background: '#171717', border: '1px solid #27272a', borderRadius: 8, padding: 20 }}>
              <div style={{ fontSize: 13, color: '#a1a1aa', marginBottom: 4 }}>{card.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#f97316' }}>{card.value}</div>
            </div>
          ))}
        </div>
      )}

      {history?.sentReferrals?.length > 0 && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Recent Referrals</h2>
          <div style={{ background: '#171717', border: '1px solid #27272a', borderRadius: 8, overflow: 'hidden' }}>
            {history.sentReferrals.slice(0, 10).map((r: any) => (
              <div key={r.id} style={{ padding: '12px 16px', borderBottom: '1px solid #27272a', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontWeight: 500 }}>{r.code}</span>
                  <span style={{ color: '#a1a1aa', marginLeft: 12, fontSize: 13 }}>Reward: ₹{r.referrerReward}</span>
                </div>
                <span style={{ fontSize: 12, color: r.status === 'completed' ? '#4ade80' : '#facc15' }}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <a href="/loyalty" style={{ color: '#f97316', textDecoration: 'none', marginTop: 16, display: 'inline-block' }}>← Back</a>
    </div>
  );
}
