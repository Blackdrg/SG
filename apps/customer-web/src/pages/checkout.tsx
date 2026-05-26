import React, { useState } from 'react';
import { Button, Card, DESIGN_TOKENS } from '@spicegarden/ui';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { ordersApi } from '@spicegarden/shared/api';
import { API_URL } from '@spicegarden/shared/constants';

const CheckoutPage = () => {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const restaurantId = useSelector((state: RootState) => state.cart.restaurantId);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [address, setAddress] = useState('Home - Sector 17, Chandigarh');
  const [tip, setTip] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Calculate totals from cart items
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 20;
  const taxes = subtotal * 0.05;
  const grandTotal = subtotal + deliveryFee + taxes + tip - promoDiscount;

  const applyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }

    try {
      // Simulate promo validation - in real app this would be an API call
      setPromoError('');
      setPromoSuccess('');
      
      // Simple simulation: WELCOME50 gives 50% off up to ₹100
      if (promoCode.toUpperCase() === 'WELCOME50') {
        const discount = Math.min(subtotal * 0.5, 100);
        setPromoDiscount(discount);
        setPromoSuccess(`Applied! You saved ₹${discount.toFixed(0)}`);
      } else if (promoCode.toUpperCase() === 'SAVE20') {
        const discount = Math.min(subtotal * 0.2, 50);
        setPromoDiscount(discount);
        setPromoSuccess(`Applied! You saved ₹${discount.toFixed(0)}`);
      } else {
        setPromoError('Invalid promo code');
        setPromoDiscount(0);
      }
    } catch (err) {
      setPromoError('Failed to apply promo code');
      setPromoDiscount(0);
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      // Prepare order data
      const orderData = {
        restaurantId: restaurantId || 'rest-001', // Fallback for demo
        deliveryAddressId: 'addr-001', // In real app, this would come from address selection
        items: cartItems.map(item => ({
          menuItemId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal,
        deliveryFee,
        tax: taxes,
        tip,
        grandTotal
      };

      // Try to place order via API
      try {
        const order = await ordersApi.create(orderData, user?.token || localStorage.getItem('sg_token') || '');
        router.push(`/tracking?order=${order.id}`);
      } catch (apiError) {
        // Fall back to simulation if API fails (for development)
        console.warn('API order creation failed, using simulation:', apiError);
        const fakeOrderId = Math.random().toString(36).substr(2, 9);
        router.push(`/tracking?order=${fakeOrderId}`);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      // Even on error, proceed to tracking for demo purposes
      router.push('/tracking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: DESIGN_TOKENS.spacing.md }}>
      <h2 style={{ marginBottom: DESIGN_TOKENS.spacing.lg }}>Checkout</h2>

      <Card title="Delivery Address">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ margin: 0 }}>{address}</p>
          <Button label="Change" onClick={() => {/* TODO: Implement address selection */}} variant="secondary" />
        </div>
      </Card>

      <div style={{ margin: `${DESIGN_TOKENS.spacing.lg}px 0` }}>
        <h3>Payment Method</h3>
        <div style={{ display: 'flex', gap: DESIGN_TOKENS.spacing.sm, flexWrap: 'wrap' }}>
          <Button label="&#x1F4B3; Card" onClick={() => setPaymentMethod('card')} variant={paymentMethod === 'card' ? 'primary' : 'secondary'} />
          <Button label="&#x1F4B0; UPI" onClick={() => setPaymentMethod('upi')} variant={paymentMethod === 'upi' ? 'primary' : 'secondary'} />
          <Button label="&#x1F4B5; Cash" onClick={() => setPaymentMethod('cash')} variant={paymentMethod === 'cash' ? 'primary' : 'secondary'} />
        </div>
      </div>

      <div style={{ margin: `${DESIGN_TOKENS.spacing.lg}px 0` }}>
        <h3>Tip</h3>
        <div style={{ display: 'flex', gap: DESIGN_TOKENS.spacing.sm }}>
          <Button label="No tip" onClick={() => setTip(0)} variant={tip === 0 ? 'primary' : 'secondary'} />
          <Button label="&#x20B9;30" onClick={() => setTip(30)} variant={tip === 30 ? 'primary' : 'secondary'} />
          <Button label="&#x20B9;50" onClick={() => setTip(50)} variant={tip === 50 ? 'primary' : 'secondary'} />
          <Button label="&#x20B9;100" onClick={() => setTip(100)} variant={tip === 100 ? 'primary' : 'secondary'} />
        </div>
      </div>

      <div style={{ margin: `${DESIGN_TOKENS.spacing.lg}px 0` }}>
        <h3>Promo Code</h3>
        <div style={{ display: 'flex', gap: DESIGN_TOKENS.spacing.sm }}>
          <input
            type="text"
            placeholder="Enter promo code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            style={{ flex: 1, padding: DESIGN_TOKENS.spacing.sm, borderRadius: DESIGN_TOKENS.radius.sm, border: '1px solid #ddd' }}
          />
          <Button label="Apply" onClick={applyPromo} variant="secondary" />
        </div>
        {promoError && (
          <p style={{ color: '#c62828', fontSize: '14px', marginTop: 4 }}>{promoError}</p>
        )}
        {promoSuccess && (
          <p style={{ color: '#2e7d32', fontSize: '14px', marginTop: 4 }}>{promoSuccess}</p>
        )}
      </div>

      <Card title="Order Summary">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: DESIGN_TOKENS.spacing.xs }}>
          <span>Item Total</span>
          <span>&#8377;{subtotal.toFixed(0)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: DESIGN_TOKENS.spacing.xs }}>
          <span>Delivery Fee</span>
          <span>&#8377;{deliveryFee}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: DESIGN_TOKENS.spacing.xs }}>
          <span>Taxes</span>
          <span>&#8377;{taxes.toFixed(0)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: DESIGN_TOKENS.spacing.xs }}>
          <span>Tip</span>
          <span>&#8377;{tip.toFixed(0)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', borderTop: '1px solid #ddd', paddingTop: DESIGN_TOKENS.spacing.sm }}>
          <span>Total</span>
          <span>&#8377;{grandTotal.toFixed(0)}</span>
        </div>
      </Card>

      <div style={{ marginTop: DESIGN_TOKENS.spacing.xl }}>
        <Button label={loading ? 'Placing Order...' : 'Place Order'} onClick={handlePlaceOrder} />
      </div>
    </div>
  );
};

export default CheckoutPage;
