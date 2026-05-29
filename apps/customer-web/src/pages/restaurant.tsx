import React, { useState } from 'react';
import { Button, DESIGN_TOKENS } from '@spicegarden/ui';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';

const RestaurantPage = () => {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('burgers');
  const dispatch = useDispatch();

  const categories = [
    { id: 'burgers', name: 'Burgers', count: 12 },
    { id: 'sides', name: 'Sides', count: 8 },
    { id: 'drinks', name: 'Drinks', count: 6 },
  ];

  const menuItems = [
    { id: 1, name: 'Whopper', desc: 'Flame-grilled beef patty', price: 149, emoji: '🍔', category: 'burgers' },
    { id: 2, name: 'Chicken Fries', desc: 'Crispy chicken fries', price: 99, emoji: '🍟', category: 'sides' },
    { id: 3, name: 'Coke', desc: '330ml Can', price: 49, emoji: '🥤', category: 'drinks' },
    { id: 4, name: 'Double Cheese', desc: 'Two patties, twice the cheese', price: 199, emoji: '🍔', category: 'burgers' },
    { id: 5, name: 'Veg Burger', desc: 'Crispy veggie patty', price: 129, emoji: '🍔', category: 'burgers' },
    { id: 6, name: 'Large Coke', desc: '1.25L Bottle', price: 79, emoji: '🥤', category: 'drinks' },
  ];

  const filtered = activeCategory === 'all' ? menuItems : menuItems.filter((item) => item.category === activeCategory);

  return (
    <div style={{ padding: DESIGN_TOKENS.spacing.md, paddingBottom: 80 }}>
      <div style={{ marginBottom: DESIGN_TOKENS.spacing.lg }}>
        <Button label="← Back" onClick={() => router.back()} variant="secondary" />
      </div>
      <div style={{ marginBottom: DESIGN_TOKENS.spacing.lg, textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '22px' }}>🍔 Burger King</h2>
        <p style={{ color: '#666', margin: '4px 0' }}>&#9733; 4.2 &middot; 25–30 min &middot; &#8377;199 minimum</p>
      </div>

      <div style={{ display: 'flex', gap: DESIGN_TOKENS.spacing.sm, overflowX: 'auto', marginBottom: DESIGN_TOKENS.spacing.lg }}>
        {categories.map((c) => (
          <Button
            key={c.id}
            label={`${c.name} (${c.count})`}
            onClick={() => setActiveCategory(c.id)}
            variant={activeCategory === c.id ? 'primary' : 'secondary'}
          />
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.sm }}>
        {filtered.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: DESIGN_TOKENS.spacing.sm, backgroundColor: 'white',
              borderRadius: DESIGN_TOKENS.radius.md, cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: DESIGN_TOKENS.spacing.sm, flex: 1 }}>
              <span style={{ fontSize: '28px' }}>{item.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{item.name}</div>
                <div style={{ fontSize: '13px', color: '#888' }}>{item.desc}</div>
              </div>
            </div>
       <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
         <span style={{ fontWeight: 'bold', color: DESIGN_TOKENS.colors.primary, whiteSpace: 'nowrap' }}>&#8377;{item.price}</span>
         <Button label="+" onClick={() => {
           // Show customization modal (simplified for demo)
           const customization = window.prompt("Add special instructions (e.g., 'No onions', 'Extra spicy'):");
           dispatch(addToCart({ 
             item: { 
               id: item.id.toString(), 
               name: item.name, 
               price: item.price, 
               quantity: 1,
               customization: customization || undefined,
               specialInstructions: customization || undefined  // For demo, using same field
             }, 
             restaurantId: 'rest-001' // Hardcoded for demo, should come from restaurant context
           }));
         }} variant="secondary" />
       </div>
          </div>
        ))}
      </div>

      {/* Bottom nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: 'white',
        borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      }}>
        {[
          { key: 'home', label: 'Home', icon: '🏠', path: '/' },
          { key: 'search', label: 'Search', icon: '🔍', path: '/search' },
          { key: 'menu', label: 'Menu', icon: '📋', path: '/menu' },
          { key: 'account', label: 'Account', icon: '👤', path: '/profile' },
        ].map((tab) => (
          <div
            key={tab.key}
            onClick={() => router.push(tab.path)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', color: tab.key === 'menu' ? DESIGN_TOKENS.colors.primary : '#999', fontSize: '11px' }}
          >
            <span style={{ fontSize: '22px' }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default RestaurantPage;
