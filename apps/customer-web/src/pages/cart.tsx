import React from 'react';
import { Button, Card, DESIGN_TOKENS } from '@spicegarden/ui';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { removeFromCart, updateQuantity } from '../redux/slices/cartSlice';
import { useRouter } from 'next/router';
import { API_URL } from '@spicegarden/shared/constants';

const CartPage = () => {
  const router = useRouter();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 20;
  const taxes = total * 0.05;
  const grandTotal = total + deliveryFee + taxes;

  const handleCheckout = () => {
    const items = JSON.stringify(cartItems);
    router.push({ pathname: '/checkout', query: { items, total: grandTotal, deliveryFee, taxes } });
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ padding: DESIGN_TOKENS.spacing.lg, textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: DESIGN_TOKENS.spacing.lg }}>&#x1F6D2;</div>
        <h2>Your cart is empty</h2>
        <p style={{ color: '#666' }}>Add items from restaurants</p>
        <Button label="Browse Restaurants" onClick={() => router.push('/')} variant="secondary" />
      </div>
    );
  }

  return (
    <div style={{ padding: DESIGN_TOKENS.spacing.md, minHeight: '100vh', backgroundColor: DESIGN_TOKENS.colors.neutral }}>
      <h2 style={{ marginBottom: DESIGN_TOKENS.spacing.md }}>Your Cart</h2>

       <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.sm, marginBottom: DESIGN_TOKENS.spacing.lg }}>
         {cartItems.map((item) => (
           <Card key={item.id} title={item.name}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                   <Button label="-" onClick={() => {
                     dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }));
                   }} variant="secondary" style={{ width: 30, height: 30, padding: 0 }} />
                   <span style={{ minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                   <Button label="+" onClick={() => {
                     dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }));
                   }} variant="secondary" style={{ width: 30, height: 30, padding: 0 }} />
                 </span>
                 <span style={{ marginLeft: DESIGN_TOKENS.spacing.md, fontWeight: 'bold', color: DESIGN_TOKENS.colors.primary }}>
                   &#8377;{item.price * item.quantity}
                 </span>
               </div>
               <Button label="Remove" onClick={() => dispatch(removeFromCart(item.id))} variant="secondary" />
             </div>
           </Card>
         ))}
       </div>

      <Card title="Bill Details">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: DESIGN_TOKENS.spacing.xs }}>
          <span>Item Total</span>
          <span>&#8377;{total}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: DESIGN_TOKENS.spacing.xs }}>
          <span>Delivery Fee</span>
          <span>&#8377;{deliveryFee}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: DESIGN_TOKENS.spacing.md }}>
          <span>Taxes</span>
          <span>&#8377;{taxes.toFixed(0)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px' }}>
          <span>Grand Total</span>
          <span>&#8377;{grandTotal.toFixed(0)}</span>
        </div>
      </Card>

      <div style={{ marginTop: DESIGN_TOKENS.spacing.lg }}>
        <Button label="Proceed to Checkout" onClick={handleCheckout} />
      </div>
    </div>
  );
};

export default CartPage;
