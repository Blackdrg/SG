export default function LoyaltyIndex() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Loyalty & Growth Engine</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Active Coupons', value: '12', href: '/loyalty/coupons' },
          { label: 'Total Referrals', value: '248', href: '/loyalty/referrals' },
          { label: 'Subscriptions', value: '89', href: '/loyalty/subscriptions' },
        ].map((card) => (
          <a key={card.label} href={card.href} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ background: '#171717', border: '1px solid #27272a', borderRadius: 8, padding: 20 }}>
              <div style={{ fontSize: 13, color: '#a1a1aa', marginBottom: 4 }}>{card.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#f97316' }}>{card.value}</div>
            </div>
          </a>
        ))}
      </div>
      <a href="/" style={{ color: '#f97316', textDecoration: 'none' }}>← Back to Dashboard</a>
    </div>
  );
}
