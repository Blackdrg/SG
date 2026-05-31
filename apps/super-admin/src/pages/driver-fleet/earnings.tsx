export default function DriverFleetEarnings() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Driver Earnings</h1>
      <p style={{ color: '#a1a1aa' }}>Select a driver to view detailed earnings breakdown.</p>
      <a href="/driver-fleet" style={{ color: '#f97316', textDecoration: 'none', marginTop: 16, display: 'inline-block' }}>← Back to Fleet</a>
    </div>
  );
}
