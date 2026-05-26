import React, { useState } from 'react';
import { Button, Card, DESIGN_TOKENS } from '@spicegarden/ui';
import { useRouter } from 'next/router';
import { API_URL } from '@spicegarden/shared/constants';

interface MenuItem {
  id: number;
  name: string;
  desc: string;
  price: number;
  image: string;
  category: string;
}

interface Category {
  id: string;
  name: string;
  count: number;
}

const MenuPage = () => {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [cart, setCart] = useState<Array<MenuItem & { quantity: number }>>([]);

  const categories: Category[] = [
    { id: 'all', name: 'All', count: 24 },
    { id: 'burgers', name: 'Burgers', count: 8 },
    { id: 'pizza', name: 'Pizza', count: 6 },
    { id: 'sides', name: 'Sides', count: 4 },
    { id: 'drinks', name: 'Drinks', count: 6 },
  ];

  const menuItems: MenuItem[] = [
    { id: 1, name: 'Classic Burger', desc: 'Lettuce, tomato, onion', price: 129, image: '🍔', category: 'burgers' },
    { id: 2, name: 'Cheese Burger', desc: 'With extra cheese', price: 149, image: '🍔', category: 'burgers' },
    { id: 3, name: 'Veggie Burger', desc: 'Plant-based patty', price: 139, image: '🍔', category: 'burgers' },
    { id: 4, name: 'Margherita Pizza', desc: 'Tomato, mozzarella, basil', price: 249, image: '🍕', category: 'pizza' },
    { id: 5, name: 'Pepperoni Pizza', desc: 'With spicy pepperoni', price: 279, image: '🍕', category: 'pizza' },
    { id: 6, name: 'Veggie Pizza', desc: 'Bell peppers, olives, onions', price: 259, image: '🍕', category: 'pizza' },
    { id: 7, name: 'French Fries', desc: 'Crispy golden fries', price: 99, image: '🍟', category: 'sides' },
    { id: 8, name: 'Onion Rings', desc: 'Battered and fried', price: 109, image: '🧅', category: 'sides' },
    { id: 9, name: 'Garlic Bread', desc: 'With herbs and cheese', price: 119, image: '🥖', category: 'sides' },
    { id: 10, name: 'Coca Cola', desc: '500ml Bottle', price: 49, image: '🥤', category: 'drinks' },
    { id: 11, name: 'Sprite', desc: '500ml Bottle', price: 49, image: '🥤', category: 'drinks' },
    { id: 12, name: 'Iced Tea', desc: 'Lemon flavored', price: 39, image: '🧃', category: 'drinks' },
  ];

  const filteredItems = activeCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === activeCategory);

  const addToCart = (item: MenuItem) => {
    setCart(prev => [...prev, { ...item, quantity: 1 }]);
  };

  const removeFromCart = (itemId: number) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    const items = JSON.stringify(cart);
    router.push({ pathname: '/checkout', query: { items, total: cartTotal } });
  };

  return (
    <div style={{ padding: DESIGN_TOKENS.spacing.md, paddingBottom: 80 }}>
      <div style={{ marginBottom: DESIGN_TOKENS.spacing.lg, textAlign: 'center' }}>
        <h2>Menu</h2>
        <p style={{ color: '#666' }}>Select items to add to your order</p>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.md }}>
        {filteredItems.map((item) => (
          <div key={item.id} style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: DESIGN_TOKENS.spacing.sm,
            marginBottom: DESIGN_TOKENS.spacing.md
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center'
            }}>
              <div style={{ fontSize: '24px' }}>{item.image}</div>
              <div>
                <span style={{ fontWeight: 'bold', color: DESIGN_TOKENS.colors.primary }}>₹{item.price}</span>
                <Button 
                  label="Add" 
                  onClick={() => addToCart(item)} 
                  variant="secondary"
                />
              </div>
            </div>
            <div style={{ marginTop: DESIGN_TOKENS.spacing.sm, fontSize: '14px', color: '#666' }}>
              {item.desc}
            </div>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div style={{ marginTop: DESIGN_TOKENS.spacing.lg }}>
          <Card title="Your Cart">
            <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.sm }}>
              {cart.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0 }}>{item.name}</h4>
                    <p style={{ margin: '4px 0 0 0', color: '#666' }}>×{item.quantity}</p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 'bold', color: DESIGN_TOKENS.colors.primary }}>
                      ₹{item.price * item.quantity}
                    </div>
                    <Button 
                      label="Remove" 
                      onClick={() => removeFromCart(item.id)} 
                      variant="secondary"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginTop: DESIGN_TOKENS.spacing.lg,
              paddingTop: DESIGN_TOKENS.spacing.md,
              borderTop: '1px solid #eee'
            }}>
              <span>Total:</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: DESIGN_TOKENS.colors.primary }}>₹{cartTotal}</span>
              <Button label="Checkout" onClick={handleCheckout} variant="secondary" />
            </div>
          </Card>
        </div>
      )}

      {/* Bottom nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: 'white',
        borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      }}>
        {[
          { key: 'home', label: 'Home', icon: '🏠', path: '/' },
          { key: 'search', label: 'Search', icon: '🔍', path: '/search' },
          { key: 'menu', label: 'Menu', icon: '📋' },
          { key: 'account', label: 'Account', icon: '👤', path: '/profile' },
        ].map((tab) => (
          <div
            key={tab.key}
            onClick={() => tab.path && router.push(tab.path)}
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

export default MenuPage;
