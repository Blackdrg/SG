import React, { useState, useEffect, useMemo } from 'react';
import { Button, Card, DESIGN_TOKENS, MOTION_EASING, SkeletonCard } from '@spicegarden/ui';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

interface Restaurant {
  id: string;
  name: string;
  description: string;
  rating: number;
  deliveryTime: number;
  isActive: boolean;
}

const HomePage = () => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const response = await fetch('/api/restaurants');
        if (!response.ok) throw new Error('Failed to load restaurants');
        const data = await response.json();
        setRestaurants(data);
      } catch (error) {
        console.error('Failed to load restaurants:', error);
        setError('Unable to load restaurants. Please check your connection.');
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };
    loadRestaurants();
  }, []);

  const categories = useMemo(() => [
    { name: 'Burgers', icon: '🍔' },
    { name: 'Pizza', icon: '🍕' },
    { name: 'Drinks', icon: '🥤' },
    { name: 'Dessert', icon: '🍰' },
    { name: 'Healthy', icon: '🥗' },
  ], []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    window.location.reload();
  };

  const containerStyle: React.CSSProperties = {
    padding: DESIGN_TOKENS.spacing.md,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    backgroundColor: DESIGN_TOKENS.colors.background,
    minHeight: '100vh',
    paddingBottom: 80,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DESIGN_TOKENS.spacing.lg,
  };

  const searchBarStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: DESIGN_TOKENS.colors.surface,
    padding: `12px ${DESIGN_TOKENS.spacing.md}px`,
    borderRadius: DESIGN_TOKENS.radius.md,
    marginBottom: DESIGN_TOKENS.spacing.lg,
    boxShadow: DESIGN_TOKENS.shadows.small,
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle} role="banner">
        <div>
          <h2 style={{ 
            margin: 0,
            ...DESIGN_TOKENS.typography.headingS,
            color: DESIGN_TOKENS.colors.textPrimary 
          }}>
            👋 {user?.name?.split(' ')[0] || 'Guest'}
          </h2>
          <p style={{ 
            margin: 0, 
            color: DESIGN_TOKENS.colors.textSecondary,
            fontSize: '14px',
            marginTop: 4
          }}>
            Deliver to: Home - Sector 17, Chandigarh
          </p>
        </div>
        <Button 
          label="🔔" 
          onClick={() => {}} 
          variant="secondary"
          ariaLabel="Notifications"
        />
      </header>

      <div
        onClick={() => router.push('/search')}
        style={searchBarStyle}
        role="button"
        tabIndex={0}
        aria-label="Search restaurants and dishes"
      >
        <span style={{ color: '#bbb', marginRight: 8, fontSize: 18 }}>🔍</span>
        <span style={{ color: '#aaa', fontSize: '15px' }}>Search restaurants, dishes…</span>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: DESIGN_TOKENS.spacing.sm, 
        overflowX: 'auto', 
        paddingBottom: DESIGN_TOKENS.spacing.sm, 
        marginBottom: DESIGN_TOKENS.spacing.lg 
      }}>
        {categories.map((cat) => (
          <div 
            key={cat.name} 
            style={{ 
              textAlign: 'center', 
              minWidth: '64px', 
              padding: DESIGN_TOKENS.spacing.sm, 
              backgroundColor: DESIGN_TOKENS.colors.surface, 
              borderRadius: DESIGN_TOKENS.radius.md, 
              cursor: 'pointer', 
              boxShadow: DESIGN_TOKENS.shadows.small 
            }}
            role="button"
            tabIndex={0}
            aria-label={`Browse ${cat.name} category`}
          >
            <div style={{ fontSize: '28px' }}>{cat.icon}</div>
            <div style={{ fontSize: '12px', color: DESIGN_TOKENS.colors.textSecondary }}>{cat.name}</div>
          </div>
        ))}
      </div>

      <div style={{
        background: `linear-gradient(45deg, ${DESIGN_TOKENS.colors.primary}, #ff7e5f)`,
        color: 'white',
        padding: DESIGN_TOKENS.spacing.lg,
        borderRadius: DESIGN_TOKENS.radius.card,
        marginBottom: DESIGN_TOKENS.spacing.xl,
        cursor: 'pointer',
      }}>
        <h2 style={{ margin: 0, fontSize: '22px' }}>🎉 50% OFF</h2>
        <p style={{ margin: '8px 0 16px 0', fontSize: '14px' }}>
          On your first 3 orders. Use code: <strong>WELCOME50</strong>
        </p>
        <Button 
          label="Order Now" 
          onClick={() => router.push('/search')}
          ariaLabel="Order now with welcome discount"
        />
      </div>

      <Card title="Recommended Restaurants" variant="elevated">
        {loading ? (
          <SkeletonCard count={3} />
        ) : error ? (
          <div style={{ padding: DESIGN_TOKENS.spacing.md }}>
            <p style={{ color: DESIGN_TOKENS.colors.danger }}>{error}</p>
            <button 
              onClick={handleRetry}
              style={{
                marginTop: DESIGN_TOKENS.spacing.sm,
                padding: `${DESIGN_TOKENS.spacing.xs}px ${DESIGN_TOKENS.spacing.sm}px`,
                backgroundColor: DESIGN_TOKENS.colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: DESIGN_TOKENS.radius.md,
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        ) : restaurants.length === 0 ? (
          <p style={{ color: DESIGN_TOKENS.colors.textSecondary, padding: DESIGN_TOKENS.spacing.md }}>
            No restaurants available right now
          </p>
        ) : (
          <div style={{ display: 'grid', gap: DESIGN_TOKENS.spacing.md }}>
            {restaurants.slice(0, 3).map((restaurant) => (
              <div 
                key={restaurant.id} 
                style={{ 
                  display: 'flex', 
                  gap: 12, 
                  cursor: 'pointer',
                  padding: DESIGN_TOKENS.spacing.sm,
                  borderRadius: DESIGN_TOKENS.radius.md,
                  transition: `background-color ${DESIGN_TOKENS.motion.micro}ms ${MOTION_EASING.easeOutSoft}`,
                }}
                onClick={() => router.push(`/restaurant?id=${restaurant.id}`)}
                role="button"
                tabIndex={0}
                aria-label={`View ${restaurant.name} details`}
              >
                <div style={{ fontSize: '32px' }}>🍽️</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', color: DESIGN_TOKENS.colors.textPrimary }}>
                    {restaurant.name}
                  </div>
                  <div style={{ fontSize: '12px', color: DESIGN_TOKENS.colors.textSecondary }}>
                    {restaurant.description}
                  </div>
                  <div style={{ display: 'flex', gap: 8, fontSize: '12px', color: DESIGN_TOKENS.colors.textSecondary }}>
                    <span>⭐ {restaurant.rating}</span>
                    <span>• {restaurant.deliveryTime} min</span>
                    <span>• {Math.round(Math.random() * 5)} km</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
        backgroundColor: DESIGN_TOKENS.colors.surface,
        borderTop: `1px solid ${DESIGN_TOKENS.colors.border}`,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        boxShadow: DESIGN_TOKENS.shadows.small,
      }}
      role="navigation"
      aria-label="Main navigation"
      >
        {[
          { key: 'home', label: 'Home', icon: '🏠', path: '/' },
          { key: 'search', label: 'Search', icon: '🔍', path: '/search' },
          { key: 'orders', label: 'Orders', icon: '📦', path: '/history' },
          { key: 'account', label: 'Account', icon: '👤', path: '/profile' },
        ].map((tab) => (
          <div
            key={tab.key}
            onClick={() => router.push(tab.path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              color: DESIGN_TOKENS.colors.textSecondary,
              fontSize: '11px',
            }}
            role="tab"
            aria-label={tab.label}
          >
            <span style={{ fontSize: '22px' }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default HomePage;