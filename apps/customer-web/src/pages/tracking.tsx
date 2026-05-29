import React, { useEffect, useState } from 'react';
import { Button, Card, DESIGN_TOKENS } from '@spicegarden/ui';
import { useTracking } from '../hooks/useTracking';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { ordersApi } from '@spicegarden/shared/api';

const TrackingPage = () => {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const [orderId, setOrderId] = useState<string | null>(null);
  const { location } = useTracking(orderId || 'driver-123');
  const [orderStatus, setOrderStatus] = useState('preparing');
  const [estimatedTime, setEstimatedTime] = useState(15);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get order ID from query params or local storage
    const queryOrderId = router.query.order as string | undefined;
    if (queryOrderId) {
      setOrderId(queryOrderId);
    } else {
      // Try to get from localStorage as fallback
      const storedOrderId = localStorage.getItem('lastOrderId');
      if (storedOrderId) {
        setOrderId(storedOrderId);
      }
    }
  }, [router.query]);

useEffect(() => {
     if (orderId) {
       const loadOrderDetails = async () => {
         try {
           setLoading(true);
           const response = await ordersApi.get(orderId, user?.token || localStorage.getItem('sg_token') || '');
           const order = response.data;
           setOrderDetails(order);
           setOrderStatus(order.status || 'preparing');
          // Update estimated time based on order status
          switch (order.status) {
            case 'preparing':
              setEstimatedTime(10 + Math.floor(Math.random() * 10));
              break;
            case 'ready':
              setEstimatedTime(5 + Math.floor(Math.random() * 5));
              break;
            case 'pickedup':
              setEstimatedTime(8 + Math.floor(Math.random() * 12));
              break;
            case 'delivered':
              setEstimatedTime(0);
              break;
            default:
              setEstimatedTime(15);
          }
        } catch (error) {
          console.error('Failed to load order details:', error);
          // Use mock data for demo
          setOrderDetails({
            id: orderId,
            status: 'preparing',
            items: [],
            total: 0
          });
        } finally {
          setLoading(false);
        }
      };
      loadOrderDetails();
    }
  }, [orderId, user?.token]);

  const statusSteps = [
    { id: 'placed', label: 'Order Placed', done: true },
    { id: 'preparing', label: 'Preparing', done: orderStatus === 'preparing' || orderStatus === 'ready' || orderStatus === 'pickedup' || orderStatus === 'delivered' },
    { id: 'ready', label: 'Ready for Pickup', done: orderStatus === 'ready' || orderStatus === 'pickedup' || orderStatus === 'delivered' },
    { id: 'pickedup', label: 'Picked Up', done: orderStatus === 'pickedup' || orderStatus === 'delivered' },
    { id: 'delivered', label: 'Delivered', done: orderStatus === 'delivered' },
  ];

  if (loading && !orderDetails) {
    return (
      <div style={{ padding: DESIGN_TOKENS.spacing.md, minHeight: '100vh', backgroundColor: DESIGN_TOKENS.colors.neutral, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading order details...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: DESIGN_TOKENS.spacing.md, minHeight: '100vh', backgroundColor: DESIGN_TOKENS.colors.neutral }}>
      <h2 style={{ marginBottom: DESIGN_TOKENS.spacing.lg }}>Track Order #{orderDetails?.id?.toUpperCase() || 'SG12345'}</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.xs, marginBottom: DESIGN_TOKENS.spacing.xl }}>
        {statusSteps.map((step, idx) => (
          <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: step.done ? DESIGN_TOKENS.colors.success : '#ddd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}>
              {step.done ? '✓' : idx + 1}
            </div>
            <span style={{ marginLeft: DESIGN_TOKENS.spacing.sm }}>{step.label}</span>
          </div>
        ))}
      </div>

      {location && (
        <Card title="Live Tracking">
          <div style={{ textAlign: 'center', marginBottom: DESIGN_TOKENS.spacing.lg }}>
            <div style={{ fontSize: '64px' }}>🛵</div>
            <p style={{ fontSize: '18px', fontWeight: 'bold' }}>Driver: Raj Kumar</p>
            <p style={{ color: DESIGN_TOKENS.colors.primary, fontWeight: 'bold' }}>ETA: {estimatedTime} mins</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: DESIGN_TOKENS.spacing.sm }}>
            <span>Current Location</span>
            <span>{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
          </div>
          <div style={{ marginTop: DESIGN_TOKENS.spacing.md }}>
            <Button label="Call Driver" onClick={() => {/* TODO: Implement dialer */}} style={{ width: '100%' }} />
            <Button label="Contact Support" onClick={() => {/* TODO: Implement support contact */}} variant="secondary" style={{ width: '100%', marginTop: DESIGN_TOKENS.spacing.sm }} />
          </div>
        </Card>
      )}

      {orderDetails && (
        <Card title="Order Details">
          <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.sm }}>
            {orderDetails.items && orderDetails.items.length > 0 ? (
              orderDetails.items.map((item: any) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: DESIGN_TOKENS.spacing.sm, borderBottom: '1px solid #eee' }}>
                  <span>{item.name} x{item.quantity}</span>
                  <span>&#8377;{item.price * item.quantity}</span>
                </div>
              ))
            ) : (
              <p>No item details available</p>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: DESIGN_TOKENS.spacing.sm }}>
              <span>Total:</span>
              <span>&#8377;{orderDetails.total || 0}</span>
            </div>
          </div>
        </Card>
      )}

      {orderStatus !== 'delivered' && (
        <div style={{ marginTop: DESIGN_TOKENS.spacing.lg, textAlign: 'center' }}>
          <Button label="Contact Restaurant" onClick={() => {/* TODO: Implement restaurant contact */}} variant="secondary" />
        </div>
      )}
    </div>
  );
};

export default TrackingPage;