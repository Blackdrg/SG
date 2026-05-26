import React, { useState, useEffect } from 'react';
import { Button, Card, DESIGN_TOKENS } from '@spicegarden/ui';
import { useRouter } from 'next/router';
import { restaurantsApi } from '@spicegarden/shared/api';

interface Restaurant {
  id: string;
  name: string;
  description: string;
  rating: number;
  deliveryTime: number;
  address: string;
}

const SearchPage = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchRestaurants = async () => {
      setLoading(true);
      try {
        const data = query.trim() 
          ? await restaurantsApi.search(query) 
          : await restaurantsApi.list();
        setRestaurants(data);
      } catch (error) {
        console.error('Search failed:', error);
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchRestaurants, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const filters = ['all', 'popular', 'offers', 'nearby', 'rated 4+'];

  return (
    <div style={{ padding: DESIGN_TOKENS.spacing.md, paddingBottom: 80 }}>
      <h2 style={{ marginBottom: DESIGN_TOKENS.spacing.lg }}>Search</h2>

      <div style={{ marginBottom: DESIGN_TOKENS.spacing.lg }}>
        <input
          type="text"
          placeholder="Search restaurants, dishes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: '100%', padding: DESIGN_TOKENS.spacing.md, borderRadius: DESIGN_TOKENS.radius.md, fontSize: '16px', border: '1px solid #ddd' }}
        />
      </div>

      <div style={{ display: 'flex', gap: DESIGN_TOKENS.spacing.sm, overflowX: 'auto', marginBottom: DESIGN_TOKENS.spacing.lg }}>
        {filters.map((f) => (
          <Button
            key={f}
            label={f.charAt(0).toUpperCase() + f.slice(1)}
            onClick={() => setActiveFilter(f)}
            variant={activeFilter === f ? 'primary' : 'secondary'}
          />
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.md }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#666' }}>Searching...</p>
        ) : restaurants.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666' }}>No restaurants found</p>
        ) : (
          restaurants.map((r) => (
            <Card key={r.id} title={r.name}>
              <p style={{ fontSize: '13px', color: '#666', margin: '0 0 16px 0' }}>
                {r.description} &middot; {r.deliveryTime} min &middot; {r.address}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 'bold', color: DESIGN_TOKENS.colors.primary }}>
                  ⭐ {r.rating}
                </div>
                <Button label="View Menu" onClick={() => router.push(`/restaurant?id=${r.id}`)} />
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Bottom nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: 'white',
        borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      }}>
        {[
          { key: 'home', label: 'Home', icon: '🏠', path: '/' },
          { key: 'search', label: 'Search', icon: '🔍' },
          { key: 'orders', label: 'Orders', icon: '📦', path: '/history' },
          { key: 'account', label: 'Account', icon: '👤', path: '/profile' },
        ].map((tab) => (
          <div
            key={tab.key}
            onClick={() => tab.path && router.push(tab.path)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', color: tab.key === 'search' ? DESIGN_TOKENS.colors.primary : '#999', fontSize: '11px' }}
          >
            <span style={{ fontSize: '22px' }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default SearchPage;