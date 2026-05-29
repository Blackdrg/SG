import React, { useState, useEffect } from 'react';
import { Button, Card, DESIGN_TOKENS, SkeletonCard } from '@spicegarden/ui';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { ordersApi } from '@spicegarden/shared/api';
import { addToCart, clearCart } from '../redux/slices/cartSlice';

const HistoryPage = () => {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'delivered' | 'cancelled' | 'preparing' | 'ready' | 'pickedup'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrderHistory = async () => {
      if (!user?.token) {
        setLoading(false);
        // Show mock data for demo when not authenticated
        setTimeout(() => {
          setOrders([
            { id: 'SG12345', date: '2026-05-20', time: '19:30', restaurant: 'Burger King', items: 2, amount: 347, status: 'delivered', rating: 5 },
            { id: 'SG12344', date: '2026-05-18', time: '12:15', restaurant: 'Pizza Hut', items: 1, amount: 299, status: 'delivered', rating: 4 },
            { id: 'SG12343', date: '2026-05-15', time: '20:45', restaurant: 'Subway', items: 3, amount: 420, status: 'delivered', rating: 5 },
            { id: 'SG12342', date: '2026-05-10', time: '14:20', restaurant: "Domino's", items: 2, amount: 380, status: 'cancelled', rating: 0 },
          ]);
        }, 600);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await ordersApi.list(user.token);
        // Transform API response to match our interface
        const transformedOrders = data.map((order: any) => ({
          id: order.id,
          date: new Date(order.createdAt).toISOString().split('T')[0],
          time: new Date(order.createdAt).toISOString().split('T')[1].substring(0, 5),
          restaurant: order.restaurant?.name || 'Unknown Restaurant',
          items: order.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0,
          amount: order.grandTotal || 0,
          status: order.status,
          rating: order.rating || 0,
        }));
        setOrders(transformedOrders);
      } catch (err) {
        console.error('Failed to load order history:', err);
        setError('Failed to load order history. Please try again later.');
        // Fallback to mock data
        setTimeout(() => {
          setOrders([
            { id: 'SG12345', date: '2026-05-20', time: '19:30', restaurant: 'Burger King', items: 2, amount: 347, status: 'delivered', rating: 5 },
            { id: 'SG12344', date: '2026-05-18', time: '12:15', restaurant: 'Pizza Hut', items: 1, amount: 299, status: 'delivered', rating: 4 },
            { id: 'SG12343', date: '2026-05-15', time: '20:45', restaurant: 'Subway', items: 3, amount: 420, status: 'delivered', rating: 5 },
            { id: 'SG12342', date: '2026-05-10', time: '14:20', restaurant: "Domino's", items: 2, amount: 380, status: 'cancelled', rating: 0 },
          ]);
        }, 600);
      } finally {
        setLoading(false);
      }
    };

    loadOrderHistory();
  }, [user?.token]);

  const filteredOrders = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  const handleReorder = async (orderId: string) => {
    try {
      const response = await ordersApi.get(orderId, user?.token || '');
      const order = response.data;
      // Add items to cart
      const cartItems = order.items?.map((item: any) => ({
        id: item.menuItemId || item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })) || [];
      
      if (cartItems.length > 0) {
        // Clear current cart and add reorder items
        dispatch(clearCart());
        cartItems.forEach((item: CartItem) => {
          dispatch(addToCart({ 
            item, 
            restaurantId: order.restaurantId || 'rest-001' 
          }));
        });
        
        // Show success message and navigate to cart
        // In a real app, we'd use a toast notification
        alert('Items added to cart! You can now proceed to checkout.');
        router.push('/cart');
      } else {
        throw new Error('No items found in order');
      }
    } catch (err) {
      console.error('Failed to reorder:', err);
      setError('Failed to reorder. Please try again.');
    }
  };

  return (
    <div style={{ padding: DESIGN_TOKENS.spacing.md, paddingBottom: 80 }}>
      <h2 style={{ marginBottom: DESIGN_TOKENS.spacing.lg }}>Order History</h2>

      {error && (
        <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '8px 12px', borderRadius: 4, marginBottom: DESIGN_TOKENS.spacing.md, fontSize: '14px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: DESIGN_TOKENS.spacing.sm, overflowX: 'auto', marginBottom: DESIGN_TOKENS.spacing.lg }}>
        {[
          { key: 'all', label: 'All' },
          { key: 'delivered', label: 'Delivered' },
          { key: 'cancelled', label: 'Cancelled' },
          { key: 'preparing', label: 'Preparing' },
          { key: 'ready', label: 'Ready' },
          { key: 'pickedup', label: 'Picked Up' }
        ].map((f) => (
          <Button
            key={f.key}
            label={f.label}
            onClick={() => setFilter(f.key as any)}
            variant={filter === f.key ? 'primary' : 'secondary'}
          />
        ))}
      </div>

       {loading ? (
         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 40 }}>
           <SkeletonCard count={3} />
           <p style={{ color: '#666', marginTop: DESIGN_TOKENS.spacing.sm }}>Loading orders…</p>
         </div>
       ) : filteredOrders.length === 0 ? (
         <div style={{ textAlign: 'center', padding: 40 }}>
           <div style={{ fontSize: 48, marginBottom: 24 }}>📦</div>
           <h3 style={{ color: DESIGN_TOKENS.colors.textSecondary, marginBottom: DESIGN_TOKENS.spacing.sm }}>No orders yet</h3>
           <p style={{ color: DESIGN_TOKENS.colors.textSecondary, fontSize: '14px', maxWidth: 300, margin: '0 auto' }}>
             Your order history will appear here once you place your first order.
           </p>
           <Button 
             label="Place First Order" 
             onClick={() => router.push('/search')} 
             variant="secondary"
           />
         </div>
       ) : (
         <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.md }}>
           {filteredOrders.map((order) => (
             <Card key={order.id} title={`#${order.id}`}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                 <div>
                   <h4 style={{ margin: 0 }}>{order.restaurant}</h4>
                   <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '13px' }}>{order.items} items &middot; &#8377;{order.amount}</p>
                 </div>
                 <span style={{
                   padding: '2px 10px', borderRadius: 12, fontSize: '12px', fontWeight: 'bold',
                   backgroundColor: 
                     order.status === 'delivered' ? '#e8f5e8' :
                     order.status === 'cancelled' ? '#f8e8e8' :
                     order.status === 'preparing' || order.status === 'ready' || order.status === 'pickedup' ? '#fff3e0' :
                     '#f5f5f5',
                   color: 
                     order.status === 'delivered' ? DESIGN_TOKENS.colors.success :
                     order.status === 'cancelled' ? '#999' :
                     order.status === 'preparing' || order.status === 'ready' || order.status === 'pickedup' ? DESIGN_TOKENS.colors.warning :
                     '#666',
                 }}>{order.status.toUpperCase()}</span>
               </div>
               <p style={{ margin: 0, color: '#999', fontSize: 13 }}>{order.date} &middot; {order.time}</p>
               <div style={{ marginTop: DESIGN_TOKENS.spacing.sm }}>
                 {order.rating > 0 && (
                   <div style={{ display: 'flex', gap: 2 }}>
                     {[1, 2, 3, 4, 5].map((star) => (
                       <span key={star} style={{ color: star <= order.rating ? '#ffc107' : '#ddd' }}>&starf;</span>
                     ))}
                   </div>
                 )}
                 <Button label="Reorder" onClick={() => handleReorder(order.id)} variant="secondary" />
               </div>
             </Card>
           ))}
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
          { key: 'orders', label: 'Orders', icon: '📦' },
          { key: 'account', label: 'Account', icon: '👤', path: '/profile' },
        ].map((tab) => (
          <div
            key={tab.key}
            onClick={() => tab.path && router.push(tab.path)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', color: tab.key === 'orders' ? DESIGN_TOKENS.colors.primary : '#999', fontSize: '11px' }}
          >
            <span style={{ fontSize: '22px' }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default HistoryPage;
