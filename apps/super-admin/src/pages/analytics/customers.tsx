import { useState, useEffect } from 'react';
import Head from 'next/head';

const API = 'http://localhost:3001/api';

export default function AnalyticsCustomers() {
  const [churn, setChurn] = useState<any>(null);
  const [repeat, setRepeat] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/analytics/churn?period=90`).then((r) => r.json()),
      fetch(`${API}/analytics/repeat-users?period=90`).then((r) => r.json()),
    ]).then(([c, r]) => { setChurn(c); setRepeat(r); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: 24 }}>
      <Head><title>Customer Analytics - SpiceGarden</title></Head>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Customer Analytics</h1>

      {loading ? (
        <p style={{ color: '#71717a' }}>Loading...</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
            {[
              { label: 'Total Customers', value: churn?.totalCustomers || 0 },
              { label: 'Active Customers', value: churn?.activeCustomers || 0 },
              { label: 'Churn Rate', value: `${churn?.churnRate || 0}%`, color: (churn?.churnRate || 0) > 30 ? '#f04e31' : '#4ade80' },
            ].map((card) => (
              <div key={card.label} style={{ background: '#171717', border: '1px solid #27272a', borderRadius: 8, padding: 20 }}>
                <div style={{ fontSize: 13, color: '#a1a1aa', marginBottom: 4 }}>{card.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: card.color || '#f97316' }}>{card.value}</div>
              </div>
            ))}
          </div>

          <div style={{ background: '#171717', border: '1px solid #27272a', borderRadius: 8, padding: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Repeat Customer Insights</h2>
            <p style={{ color: '#a1a1aa', fontSize: 14, marginBottom: 16 }}>
              {repeat?.repeatCustomers || 0} repeat customers · Avg frequency: {repeat?.avgFrequency || 0} orders
            </p>
            {repeat?.topRepeatCustomers?.length > 0 && (
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#71717a' }}>Top Customers</h3>
                {repeat.topRepeatCustomers.slice(0, 5).map((c: any) => (
                  <div key={c.userId} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #27272a', fontSize: 13 }}>
                    <span>{c.userId.slice(0, 10)}</span>
                    <span style={{ color: '#a1a1aa' }}>{c.orderCount} orders · ₹{c.totalSpent?.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
      <a href="/analytics" style={{ color: '#f97316', textDecoration: 'none', marginTop: 16, display: 'inline-block' }}>← Back to Analytics</a>
    </div>
  );
}
