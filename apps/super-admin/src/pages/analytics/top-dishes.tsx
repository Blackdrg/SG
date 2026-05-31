import { useState, useEffect } from 'react';
import Head from 'next/head';

const API = 'http://localhost:3001/api';

export default function AnalyticsTopDishes() {
  const [dishes, setDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/analytics/top-dishes?period=30`)
      .then((r) => r.json())
      .then((d) => { setDishes(d.dishes || d || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: 24 }}>
      <Head><title>Top Dishes - SpiceGarden</title></Head>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Top Selling Dishes</h1>

      {loading ? (
        <p style={{ color: '#71717a' }}>Loading...</p>
      ) : (
        <div style={{ background: '#171717', border: '1px solid #27272a', borderRadius: 8, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #27272a' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: '#a1a1aa', fontWeight: 500 }}>Rank</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: '#a1a1aa', fontWeight: 500 }}>Dish</th>
                <th style={{ textAlign: 'right', padding: '12px 16px', color: '#a1a1aa', fontWeight: 500 }}>Qty Sold</th>
                <th style={{ textAlign: 'right', padding: '12px 16px', color: '#a1a1aa', fontWeight: 500 }}>Revenue</th>
                <th style={{ textAlign: 'right', padding: '12px 16px', color: '#a1a1aa', fontWeight: 500 }}>Customers</th>
              </tr>
            </thead>
            <tbody>
              {dishes.map((dish: any, idx: number) => (
                <tr key={dish.dishId || idx} style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <td style={{ padding: '10px 16px', color: '#f97316', fontWeight: 600 }}>#{idx + 1}</td>
                  <td style={{ padding: '10px 16px' }}>{dish.name || 'Unknown'}</td>
                  <td style={{ padding: '10px 16px', textAlign: 'right', color: '#a1a1aa' }}>{dish.totalQuantity || 0}</td>
                  <td style={{ padding: '10px 16px', textAlign: 'right', color: '#4ade80' }}>₹{(dish.totalRevenue || 0).toFixed(0)}</td>
                  <td style={{ padding: '10px 16px', textAlign: 'right', color: '#a1a1aa' }}>{dish.uniqueCustomers || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <a href="/analytics" style={{ color: '#f97316', textDecoration: 'none', marginTop: 16, display: 'inline-block' }}>← Back to Analytics</a>
    </div>
  );
}
