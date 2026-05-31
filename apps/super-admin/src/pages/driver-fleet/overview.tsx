import { useState, useEffect } from 'react';
import Head from 'next/head';

const API = 'http://localhost:3001/api';

export default function DriverFleetOverview() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/drivers`)
      .then((r) => r.json())
      .then((data) => { setDrivers(data.drivers || data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: 24 }}>
      <Head><title>Driver Fleet - SpiceGarden</title></Head>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Driver Fleet Management</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total Drivers', value: drivers.length, color: '#f97316' },
          { label: 'Active', value: drivers.filter((d) => d.status === 'active' || d.kycStatus === 'approved').length, color: '#4ade80' },
          { label: 'Pending KYC', value: drivers.filter((d) => d.kycStatus === 'pending').length, color: '#facc15' },
          { label: 'Avg Rating', value: drivers.length ? (drivers.reduce((s, d) => s + (d.rating || 0), 0) / drivers.length).toFixed(1) : '0', color: '#60a5fa' },
        ].map((card) => (
          <div key={card.label} style={{ background: '#171717', border: '1px solid #27272a', borderRadius: 8, padding: 20 }}>
            <div style={{ fontSize: 13, color: '#a1a1aa', marginBottom: 4 }}>{card.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#71717a' }}>Loading drivers...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #27272a' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#a1a1aa', fontWeight: 500 }}>Name</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#a1a1aa', fontWeight: 500 }}>Vehicle</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#a1a1aa', fontWeight: 500 }}>KYC</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#a1a1aa', fontWeight: 500 }}>Rating</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#a1a1aa', fontWeight: 500 }}>Deliveries</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#a1a1aa', fontWeight: 500 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => (
                <tr key={d.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <td style={{ padding: '10px 12px' }}>{d.user?.email || d.id.slice(0, 8)}</td>
                  <td style={{ padding: '10px 12px', color: '#a1a1aa' }}>{d.vehicleType} · {d.vehicleNumber}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600,
                      background: d.kycStatus === 'approved' ? '#4ade8020' : d.kycStatus === 'pending' ? '#facc1520' : '#f04e3120',
                      color: d.kycStatus === 'approved' ? '#4ade80' : d.kycStatus === 'pending' ? '#facc15' : '#f04e31',
                    }}>
                      {d.kycStatus}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>{d.rating || '—'}</td>
                  <td style={{ padding: '10px 12px', color: '#a1a1aa' }}>{d.totalDeliveries || 0}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <button
                      onClick={() => window.location.href = `/driver-fleet/earnings?driverId=${d.id}`}
                      style={{ background: 'transparent', border: '1px solid #f97316', color: '#f97316', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
