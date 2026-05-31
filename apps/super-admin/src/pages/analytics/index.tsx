import { useState, useEffect } from 'react';
import Head from 'next/head';

const API = 'http://localhost:3001/api';

export default function AnalyticsOverview() {
  const [data, setData] = useState<any>(null);
  const [period, setPeriod] = useState('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/analytics/platform?period=${period}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [period]);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: 24 }}>
      <Head><title>Analytics Overview - SpiceGarden</title></Head>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Analytics Overview</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {['7d', '30d', '90d'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{ padding: '6px 14px', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: 500,
                background: period === p ? '#f97316' : '#171717',
                color: period === p ? '#fff' : '#a1a1aa',
                border: '1px solid #27272a',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#71717a' }}>Loading analytics...</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
            {[
              { label: 'Total Orders', value: data?.conversionFunnel?.funnel?.ordersPlaced || '—' },
              { label: 'Revenue', value: `₹${(data?.conversionFunnel?.avgOrderValue * (data?.conversionFunnel?.funnel?.ordersPlaced || 0) || 0).toFixed(0)}` },
              { label: 'Avg Order Value', value: `₹${data?.conversionFunnel?.avgOrderValue?.toFixed(0) || '—'}` },
              { label: 'Active Customers', value: data?.churnAnalysis?.activeCustomers || '—' },
            ].map((card) => (
              <div key={card.label} style={{ background: '#171717', border: '1px solid #27272a', borderRadius: 8, padding: 20 }}>
                <div style={{ fontSize: 13, color: '#a1a1aa', marginBottom: 4 }}>{card.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#f97316' }}>{card.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <a href="/analytics/top-dishes" style={{ background: '#171717', border: '1px solid #27272a', borderRadius: 8, padding: 20, textDecoration: 'none', color: '#fff' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Top Dishes</h3>
              <p style={{ fontSize: 13, color: '#71717a' }}>Best selling items</p>
            </a>
            <a href="/analytics/customers" style={{ background: '#171717', border: '1px solid #27272a', borderRadius: 8, padding: 20, textDecoration: 'none', color: '#fff' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Customers</h3>
              <p style={{ fontSize: 13, color: '#71717a' }}>Churn & repeat analysis</p>
            </a>
            <a href="/analytics/conversion" style={{ background: '#171717', border: '1px solid #27272a', borderRadius: 8, padding: 20, textDecoration: 'none', color: '#fff' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Conversion</h3>
              <p style={{ fontSize: 13, color: '#71717a' }}>Funnel analysis</p>
            </a>
          </div>
        </>
      )}
      <a href="/" style={{ color: '#f97316', textDecoration: 'none', marginTop: 24, display: 'inline-block' }}>← Back to Dashboard</a>
    </div>
  );
}
