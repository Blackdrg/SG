import React, { useState, useEffect } from 'react';
import { Button, Card, DESIGN_TOKENS } from '@spicegarden/ui';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { logout } from '../redux/slices/authSlice';
import { restaurantsApi } from '@spicegarden/shared/api';

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
  const [activeDriverId, setActiveDriverId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'orders' | 'account'>('home');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const data = await restaurantsApi.list();
        setRestaurants(data);
      } catch (error) {
        console.error('Failed to load restaurants:', error);
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };
    loadRestaurants();
  }, []);

  const categories = [
    { name: 'Burgers', icon: '🍔' },
    { name: 'Pizza', icon: '🍕' },
    { name: 'Drinks', icon: '🥤' },
    { name: 'Dessert', icon: '🍰' },
    { name: 'Healthy', icon: '🥗' },
  ];

  return (
    <div style={{ padding: DESIGN_TOKENS.spacing.md, fontFamily: DESIGN_TOKENS.typography.fontFamily, backgroundColor: DESIGN_TOKENS.colors.neutral, minHeight: '100vh', paddingBottom: 80 }}>
       {/* Header */}
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: DESIGN_TOKENS.spacing.lg }}>
         <div>
           <h2 style={{ margin: 0 }}>
             &#x1F44B; 
             {user?.name?.split(' ')[0] || 'Guest'}
           </h2>
           <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
             Deliver to: Home - Sector 17, Chandigarh
           </p>
         </div>
         <Button label="🔔" onClick={() => {}} variant="secondary" />
       </div>

      {/* Search bar */}
      <div
        onClick={() => router.push('/search')}
        style={{
          display: 'flex', alignItems: 'center', padding: '12px 16px',
          backgroundColor: 'white', borderRadius: DESIGN_TOKENS.radius.md,
          marginBottom: DESIGN_TOKENS.spacing.lg, cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}
      >
        <span style={{ color: '#bbb', marginRight: 8, fontSize: 18 }}>&#x1F50D;</span>
        <span style={{ color: '#aaa', fontSize: '15px' }}>Search restaurants, dishes…</span>
      </div>

      {/* Categories */}
      <div style={{ display: 'flex', gap: DESIGN_TOKENS.spacing.sm, overflowX: 'auto', paddingBottom: DESIGN_TOKENS.spacing.sm, marginBottom: DESIGN_TOKENS.spacing.lg }}>
        {categories.map((cat) => (
          <div key={cat.name} style={{ textAlign: 'center', minWidth: '64px', padding: DESIGN_TOKENS.spacing.sm, backgroundColor: 'white', borderRadius: DESIGN_TOKENS.radius.md, cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '28px' }}>{cat.icon}</div>
            <div style={{ fontSize: '12px', color: '#555' }}>{cat.name}</div>
          </div>
        ))}
      </div>

      {/* Offers Banner */}
      <div style={{ backgroundColor: DESIGN_TOKENS.colors.primary, color: 'white', padding: DESIGN_TOKENS.spacing.lg, borderRadius: DESIGN_TOKENS.radius.lg, marginBottom: DESIGN_TOKENS.spacing.xl, background: 'linear-gradient(45deg, #f04e31, #ff7e5f)', cursor: 'pointer' }}>
        <h2 style={{ margin: 0, fontSize: '22px' }}>🎉 50% OFF</h2>
        <p style={{ margin: '8px 0 16px 0', fontSize: '14px' }}>On your first 3 orders. Use code: <strong>WELCOME50</strong></p>
        <Button label="Order Now" onClick={() => router.push('/search')} />
      </div>

       {/* Recommended Restaurants */}
       <Card title="Recommended Restaurants" style={{ marginBottom: DESIGN_TOKENS.spacing.lg }}>
         {loading ? (
           <p style={{ color: '#666' }}>Loading restaurants...</p>
         ) : restaurants.length === 0 ? (
           <p style={{ color: '#666' }}>No restaurants available right now</p>
         ) : (
           <div style={{ display: 'grid', gap: DESIGN_TOKENS.spacing.md }}>
             {restaurants.slice(0, 3).map((restaurant) => (
               <div key={restaurant.id} style={{ display: 'flex', gap: 12, cursor: 'pointer' }} onClick={() => router.push(`/restaurant?id=${restaurant.id}`)}>
                 <div style={{ fontSize: '32px' }}>🍽️</div>
                 <div style={{ flex: 1 }}>
                   <div style={{ fontWeight: 'bold' }}>{restaurant.name}</div>
                   <div style={{ fontSize: '12px', color: '#666' }}>{restaurant.description}</div>
                   <div style={{ display: 'flex', gap: 8, fontSize: '12px', color: '#999' }}>
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

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: DESIGN_TOKENS.spacing.sm }}>
        <Button label="Track Order" onClick={() => setActiveDriverId('driver-123')} />
        <Button label="Browse Menu" onClick={() => router.push('/menu')} variant="secondary" />
      </div>

      {activeDriverId && (
        <div style={{ marginTop: DESIGN_TOKENS.spacing.xl }}>
          <Card title="Live Tracking">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>🛵</div>
              <p>Driver <strong>#{activeDriverId}</strong></p>
              <p style={{ color: DESIGN_TOKENS.colors.success, fontWeight: 'bold' }}>ETA: ~5 mins</p>
            </div>
            <div style={{ marginTop: 16 }}>
              <Button label="Stop Tracking" onClick={() => setActiveDriverId(null)} variant="secondary" style={{ width: '100%' }} />
            </div>
          </Card>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: 'white',
        borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.05)',
      }}>
        {[
          { key: 'home', label: 'Home', icon: '🏠', path: '/' },
          { key: 'search', label: 'Search', icon: '🔍', path: '/search' },
          { key: 'orders', label: 'Orders', icon: '📦', path: '/history' },
          { key: 'account', label: 'Account', icon: '👤', path: '/profile' },
        ].map((tab) => (
          <div
            key={tab.key}
            onClick={() => { setActiveTab(tab.key as any); router.push(tab.path); }}
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

export default HomePage;