import React, { useState } from 'react';
import { Button, Card, DESIGN_TOKENS } from '@spicegarden/ui';
import { useRouter } from 'next/router';

const WalletPage = () => {
  const router = useRouter();
  const [balance, setBalance] = useState(500);
  const [transactionHistory] = useState([
    { id: 1, type: 'credit' as const, amount: 500, description: 'Welcome Bonus', date: '2026-05-20' },
    { id: 2, type: 'debit' as const, amount: 347, description: 'Order #SG12345', date: '2026-05-21' },
    { id: 3, type: 'credit' as const, amount: 100, description: 'Referral Bonus', date: '2026-05-22' },
    { id: 4, type: 'debit' as const, amount: 30, description: 'Order #SG12344', date: '2026-05-18' },
    { id: 5, type: 'credit' as const, amount: 200, description: 'Top-up', date: '2026-05-15' },
  ]);
  const [activeTab] = useState<'home' | 'search' | 'wallet' | 'account'>('wallet');

  const addMoney = () => {
    setBalance((prev) => prev + 100);
  };

  const handleWithdraw = () => {
    alert('Withdrawal feature coming soon');
  };

  return (
    <div style={{ padding: DESIGN_TOKENS.spacing.md, paddingBottom: 80 }}>
      <h2 style={{ marginBottom: DESIGN_TOKENS.spacing.lg }}>My Wallet</h2>

      <Card title="Wallet Balance" isElevated>
        <div style={{
          textAlign: 'center', padding: `${DESIGN_TOKENS.spacing.lg}px 0`,
          backgroundColor: '#f0f8ff', borderRadius: DESIGN_TOKENS.radius.md,
        }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '2.5rem', color: DESIGN_TOKENS.colors.primary }}>&#8377;{balance}</h1>
          <p style={{ margin: 0, color: '#666' }}>Available balance</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: DESIGN_TOKENS.spacing.md, marginTop: DESIGN_TOKENS.spacing.lg }}>
          <Button label="Add Money" onClick={addMoney} />
          <Button label="Withdraw" onClick={handleWithdraw} variant="secondary" />
        </div>
      </Card>

      <Card title="Transaction History" style={{ marginTop: DESIGN_TOKENS.spacing.lg }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {transactionHistory.map((txn) => (
            <div
              key={txn.id}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: `${DESIGN_TOKENS.spacing.sm}px 0`,
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              <div>
                <h4 style={{ margin: 0, fontSize: '14px' }}>{txn.description}</h4>
                <p style={{ margin: '4px 0 0 0', color: '#999', fontSize: '12px' }}>{txn.date}</p>
              </div>
              <span style={{
                fontWeight: 'bold',
                color: txn.type === 'credit' ? DESIGN_TOKENS.colors.success : DESIGN_TOKENS.colors.danger,
              }}>
                {txn.type === 'credit' ? '+' : '-'}&#8377;{txn.amount}
              </span>
            </div>
          ))}
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
          { key: 'wallet', label: 'Wallet', icon: '💰' },
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

export default WalletPage;
