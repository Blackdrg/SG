import React, { useState } from 'react';
import { Button, Card, DESIGN_TOKENS, Skeleton, SkeletonCard } from '@spicegarden/ui';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { ordersApi, authApi } from '@spicegarden/shared/api';

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
  const [orderError, setOrderError] = useState(''); // New state for order/payment errors

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
    // Reset any previous error states
    setPromoError('');
    setPromoSuccess('');
    setOrderError('');
    
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
        const response = await ordersApi.create(orderData, user?.token || localStorage.getItem('sg_token') || '');
        router.push(`/tracking?order=${response.data.id}`);
      } catch (apiError: unknown) {
        // Check if it's a payment-related error
        const errorMessage = apiError instanceof Error ? apiError.message : '';
        
        if (errorMessage.includes('payment') || errorMessage.includes('card') || errorMessage.includes('insufficient')) {
          // Payment-specific error
          setOrderError('Payment failed: ' + errorMessage);
          // Don't proceed to tracking on payment failure
        } else if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
          // Auth error - try to refresh token
          const refreshToken = localStorage.getItem('sg_token');
          if (refreshToken) {
            try {
              const refreshResponse = await authApi.refreshToken(refreshToken);
              // Update token in localStorage and state
              localStorage.setItem('sg_token', refreshResponse.data.access_token);
// Retry the order with new token
               const retryResponse = await ordersApi.create(orderData, refreshResponse.data.access_token);
               router.push(`/tracking?order=${retryResponse.data.id}`);
              return;
            } catch (refreshError) {
              // If refresh fails, show auth error
              setOrderError('Session expired. Please sign in again.');
              // Redirect to login after a delay
              setTimeout(() => {
                router.push('/auth');
              }, 2000);
              return;
            }
          } else {
            setOrderError('Session expired. Please sign in again.');
            setTimeout(() => {
              router.push('/auth');
            }, 2000);
            return;
          }
        } else {
          // Generic error
          setOrderError('Order failed: ' + errorMessage);
        }
        
        // Don't proceed to tracking on error
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setOrderError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: DESIGN_TOKENS.spacing.md }}>
      <h2 style={{ marginBottom: DESIGN_TOKENS.spacing.lg }}>Checkout</h2>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.lg }}>
          <SkeletonCard count={2} />
          <div style={{ margin: `${DESIGN_TOKENS.spacing.lg}px 0` }}>
            <h3>Payment Method</h3>
            <div style={{ display: 'flex', gap: DESIGN_TOKENS.spacing.sm, flexWrap: 'wrap' }}>
              <Skeleton width={80} height={20} variant="rectangular" style={{ marginBottom: DESIGN_TOKENS.spacing.xs }} />
              <Skeleton width={80} height={20} variant="rectangular" style={{ marginBottom: DESIGN_TOKENS.spacing.xs }} />
              <Skeleton width={80} height={20} variant="rectangular" />
            </div>
          </div>
          <div style={{ margin: `${DESIGN_TOKENS.spacing.lg}px 0` }}>
            <h3>Tip</h3>
            <div style={{ display: 'flex', gap: DESIGN_TOKENS.spacing.sm }}>
              <Skeleton width={60} height={20} variant="rectangular" style={{ marginRight: DESIGN_TOKENS.spacing.sm }} />
              <Skeleton width={60} height={20} variant="rectangular" style={{ marginRight: DESIGN_TOKENS.spacing.sm }} />
              <Skeleton width={60} height={20} variant="rectangular" style={{ marginRight: DESIGN_TOKENS.spacing.sm }} />
              <Skeleton width={60} height={20} variant="rectangular" />
            </div>
          </div>
          <div style={{ margin: `${DESIGN_TOKENS.spacing.lg}px 0` }}>
            <h3>Promo Code</h3>
            <div style={{ display: 'flex', gap: DESIGN_TOKENS.spacing.sm }}>
              <Skeleton width={200} height={20} variant="rectangular" style={{ flex: 1, marginRight: DESIGN_TOKENS.spacing.sm }} />
              <Skeleton width={60} height={20} variant="rectangular" />
            </div>
          </div>
          <SkeletonCard count={2} />
        </div>
      ) : (
        <>
          <Card title="Delivery Address">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0 }}>{address}</p>
              <Button label="Change" onClick={() => {
                const newAddress = prompt('Enter your delivery address:', address);
                if (newAddress !== null && newAddress.trim() !== '') {
                  setAddress(newAddress);
                }
              }} variant="secondary" />
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
               <div style={{ textAlign: 'center', margin: `${DESIGN_TOKENS.spacing.lg}px 0` }}>
                 <p style={{ color: '#2e7d32', fontSize: '14px', marginTop: 4 }}>{promoSuccess}</p>
               </div>
             )}
            {orderError && (
              <p style={{ color: '#c62828', fontSize: '14px', marginTop: 4 }}>{orderError}</p>
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
        </>
      )}

      <div style={{ marginTop: DESIGN_TOKENS.spacing.xl }}>
        <Button label={loading ? 'Placing Order...' : 'Place Order'} onClick={handlePlaceOrder} />
      </div>
    </div>
  );
};

export default CheckoutPage;