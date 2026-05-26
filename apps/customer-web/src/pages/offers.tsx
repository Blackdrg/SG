import React, { useState } from 'react';
import { Button, Card, DESIGN_TOKENS } from '@spicegarden/ui';
import { useRouter } from 'next/router';

interface Offer {
  id: number;
  title: string;
  description: string;
  code: string;
  validTill: string;
  type: 'percentage' | 'fixed' | 'bogo';
  value: number;
  minOrder: number;
}

const OffersPage = () => {
  const router = useRouter();
  const [offers] = useState<Offer[]>([
    { id: 1, title: 'Flat 50% Off', description: 'On your first 3 orders', code: 'WELCOME50', validTill: '2026-06-30', type: 'percentage', value: 50, minOrder: 199 },
    { id: 2, title: '₹100 Off', description: 'On orders above ₹499', code: 'SAVE100', validTill: '2026-05-31', type: 'fixed', value: 100, minOrder: 499 },
    { id: 3, title: 'Buy 1 Get 1 Free', description: 'On selected pizzas', code: 'PIZZABOGO', validTill: '2026-06-15', type: 'bogo', value: 0, minOrder: 0 },
  ]);
  const [activeTab] = useState<'home' | 'search' | 'offers' | 'account'>('offers');

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
  };

  return (
    <div style={{ padding: DESIGN_TOKENS.spacing.md, paddingBottom: 80 }}>
      <h2 style={{ marginBottom: DESIGN_TOKENS.spacing.lg }}>Offers &amp; Promos</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.md }}>
        {offers.map((offer) => (
          <Card key={offer.id} title={offer.title} isElevated>
            <p style={{ color: '#666', marginBottom: DESIGN_TOKENS.spacing.sm }}>{offer.description}</p>
            <div style={{ backgroundColor: '#FFF3E0', borderRadius: 8, padding: '8px 12px', marginBottom: DESIGN_TOKENS.spacing.sm }}>
              <span style={{ fontWeight: 'bold', color: '#E65100', fontSize: '15px' }}>
                {offer.type === 'percentage' ? `-${offer.value}%` : offer.type === 'fixed' ? `-₹${offer.value}` : 'BOGO'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: DESIGN_TOKENS.spacing.sm }}>
              <div style={{ background: '#f5f5f5', padding: '6px 12px', borderRadius: 4, fontFamily: 'monospace', fontSize: '15px', fontWeight: 'bold' }}>{offer.code}</div>
              <span style={{ color: '#999', fontSize: '13px' }}>Valid till {offer.validTill}</span>
            </div>
            <div style={{ display: 'flex', gap: DESIGN_TOKENS.spacing.sm }}>
              <Button label="Copy Code" onClick={() => copyCode(offer.code)} variant="secondary" />
              <Button label="Use Now" onClick={() => router.push('/')} />
            </div>
          </Card>
        ))}
      </div>

      <Card title="Refer &amp; Earn" isElevated style={{ marginTop: DESIGN_TOKENS.spacing.lg }}>
        <p style={{ marginBottom: DESIGN_TOKENS.spacing.md }}>Share your code — earn &#8377;100 for every friend's first order.</p>
        <div style={{ display: 'flex', gap: DESIGN_TOKENS.spacing.sm }}>
          <div style={{ flex: 1, background: '#f5f5f5', padding: '10px 12px', borderRadius: 8, fontFamily: 'monospace', fontWeight: 'bold', textAlign: 'center' }}>SPICE123</div>
          <Button label="Share" onClick={() => {}} />
        </div>
      </Card>

      {/* Bottom nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: 'white',
        borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      }}>
        {[
          { key: 'home', label: 'Home', icon: '🏠', path: '/' },
          { key: 'search', label: 'Search', icon: '🔍', path: '/search' },
          { key: 'offers', label: 'Offers', icon: '🎁' },
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

export default OffersPage;
