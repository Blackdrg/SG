import React, { useState } from 'react';
import { Button, Card, DESIGN_TOKENS } from '@spicegarden/ui';
import { useRouter } from 'next/router';

interface Subscription {
  id: number;
  name: string;
  price: number;
  benefits: string[];
  active: boolean;
  nextBilling: string;
}

const SubscriptionsPage = () => {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    { id: 1, name: 'SpiceGarden Prime', price: 99, benefits: ['Free Delivery on All Orders', 'Priority Customer Support', 'Extra 5% Off Every Order'], active: true, nextBilling: '2026-06-15' },
    { id: 2, name: 'Weekly Meal Plan', price: 199, benefits: ['4 Chef-Selected Meals/Week', 'Skip Any Week', 'Partner Restaurant Priority'], active: false, nextBilling: '2026-06-01' },
  ]);
  const [activeTab] = useState<'home' | 'search' | 'subs' | 'account'>('subs');

  const toggleSubscription = (id: number) => {
    setSubscriptions((prev) => prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
  };

  return (
    <div style={{ padding: DESIGN_TOKENS.spacing.md, paddingBottom: 80 }}>
      <h2 style={{ marginBottom: DESIGN_TOKENS.spacing.lg }}>My Subscriptions</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.md }}>
        {subscriptions.map((sub) => (
          <Card key={sub.id} title={sub.name} isElevated>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: DESIGN_TOKENS.spacing.md }}>
              <div>
                <span style={{ fontSize: '22px', fontWeight: 'bold', color: DESIGN_TOKENS.colors.primary }}>&#8377;{sub.price}</span>
                <span style={{ color: '#999', fontSize: '14px' }}> / month</span>
              </div>
              <span style={{
                padding: '4px 12px', borderRadius: 16, fontSize: '12px', fontWeight: 'bold',
                backgroundColor: sub.active ? '#e8f5e8' : '#f5f5f5',
                color: sub.active ? DESIGN_TOKENS.colors.success : '#999',
              }}>{sub.active ? 'ACTIVE' : 'INACTIVE'}</span>
            </div>
            <ul style={{ margin: '0 0 16px 20px', padding: 0, color: '#555', fontSize: '14px' }}>
              {sub.benefits.map((b, i) => <li key={i} style={{ marginBottom: 4 }}>{b}</li>)}
            </ul>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#999', fontSize: '13px' }}>Next billing: {sub.nextBilling}</span>
              <Button label={sub.active ? 'Cancel' : 'Activate'} onClick={() => toggleSubscription(sub.id)} variant={sub.active ? 'secondary' : 'primary'} />
            </div>
          </Card>
        ))}
      </div>

      <Card title="Explore More Plans" isElevated style={{ marginTop: DESIGN_TOKENS.spacing.lg }}>
        <p style={{ marginBottom: DESIGN_TOKENS.spacing.md }}>Save on every order. Gold, Premium, Family options available.</p>
        <Button label="View All Plans" onClick={() => {}} />
      </Card>

      {/* Bottom nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: 'white',
        borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      }}>
        {[
          { key: 'home', label: 'Home', icon: '🏠', path: '/' },
          { key: 'search', label: 'Search', icon: '🔍', path: '/search' },
          { key: 'subs', label: 'Subs', icon: '⭐' },
          { key: 'account', label: 'Account', icon: '👤', path: '/profile' },
        ].map((tab) => (
          <div
            key={tab.key}
            onClick={() => tab.path && router.push(tab.path)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', color: activeTab === tab.key ? DESIGN_TOKENS.colors.primary : '#999', fontSize: '11px' }}
          >
            <span style={{ fontSize: '22px' }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default SubscriptionsPage;
