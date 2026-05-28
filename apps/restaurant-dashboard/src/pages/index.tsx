import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@spicegarden/ui';
import { io, Socket } from 'socket.io-client';

// ── Types ──────────────────────────────────────────────────────────────────

// ── Pre-seeded demo data ────────────────────────────────────────────────────

const DEMO_ITEMS: OrderItem[] = [
  { id: 'i1', name: 'Zinger Burger', qty: 1, modifiers: ['Extra Spicy'], note: 'Less onions' },
  { id: 'i2', name: 'Large Fries', qty: 1 },
  { id: 'i3', name: 'Coke', qty: 1, modifiers: ['Less Ice'] },
];

const seedInventory: InventoryItem[] = [
  { id: 'inv-1', name: 'Burger Buns', inStock: 3, threshold: 20 },
  { id: 'inv-2', name: 'Cheese Slices', inStock: 8, threshold: 50 },
  { id: 'inv-3', name: 'Tomato', inStock: 2, threshold: 15 },
  { id: 'inv-4', name: 'Ice Cream', inStock: 1, threshold: 10 },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

const now = () => new Date();
const elapsedMins = (startedAt: Date) => Math.max(0, Math.floor((+now() - +startedAt) / 60000));

function orderElapsed(order: Order) {
  return order.prepStartedAt ? elapsedMins(order.prepStartedAt) : 0;
}

function isDelayed(order: Order) {
  return order.status === 'preparing' && orderElapsed(order) > order.estPrepMins;
}

function demoOrder(id: string, overrides: Partial<Order> = {}): Order {
  return {
    id,
    orderNumber: `SG-${id.slice(-6).toUpperCase()}`,
    diner: 'Guest',
    table: 'T-0' + id.length,
    serviceType: 'delivery',
    items: DEMO_ITEMS.map((i) => ({ ...i, id: `${id}-${i.id}` })),
    createdAt: now(),
    status: 'new',
    estPrepMins: 14,
    ...overrides,
  };
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function KitchenDashboard() {
   const [orders, setOrders] = useState<Order[]>(() =>
     [
       demoOrder('a1', { status: 'preparing', prepStartedAt: new Date(+now() - 17 * 60000), estPrepMins: 14 }),
       demoOrder('b2', { status: 'accepted', estPrepMins: 10 }),
       demoOrder('c3', { status: 'ready', estPrepMins: 8 }),
       demoOrder('d4', { status: 'new', estPrepMins: 12 }),
     ]
   );
   const [batchMode, setBatchMode] = useState(false);
   const [inventory, setInventory] = useState<InventoryItem[]>(seedInventory);
   const [activeTab, setActiveTab] = useState<'kitchen' | 'inventory'>('kitchen');
   const [audioEnabled, setAudioEnabled] = useState(true);
   const [activeSounds, setActiveSounds] = useState<string[]>([]);
   const [lastAction, setLastAction] = useState<string>('');

  // ── Sound / new-order alert ───────────────────────────────────────────────

  const playNewOrderSound = useCallback(() => {
    if (!audioEnabled) return;
    // Browser cannot reliably auto-play without user interaction;
    // store id so user can click "play" when browser allows.
    const id = Date.now().toString();
    setActiveSounds((prev) => [id, ...prev]);
  }, [audioEnabled]);

  function squashSound(id: string) {
    setActiveSounds((prev) => prev.filter((x) => x !== id));
  }

   // ── Socket connection ─────────────────────────────────────────────────────

   useEffect(() => {
     const socket: Socket = io('http://localhost:3001', {
       path: '/socket.io/',
       transports: ['websocket', 'polling'],
     });

     socket.on('connect', () => console.log('[KDS] connected:', socket.id));
     socket.on('disconnect', () => console.log('[KDS] disconnected'));
     socket.on('newOrder', (order: Order) => {
       setOrders((prev) => [{ ...order, createdAt: new Date(order.createdAt || Date.now()) }, ...prev]);
       setLastAction(`New order #${order.orderNumber} received`);
       playNewOrderSound();
     });
     socket.on('inventoryAlert', (item: InventoryItem) => {
       setInventory((prev) => {
         const found = prev.find((i) => i.id === item.id);
         if (found) found.inStock = Math.max(0, found.inStock - 1);
         return [...prev];
       });
     });

     return () => { socket.disconnect(); };
   }, [playNewOrderSound]);

   // Seed inventory on mount too

  // ── Status transitions ─────────────────────────────────────────────────────

  const transition = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const updated: Order = { ...o, status };
        if (status === 'preparing') updated.prepStartedAt = new Date();
        if (status === 'ready') updated.prepStartedAt = undefined;
        return updated;
      })
    );
    setLastAction(`Order #${orderId.slice(-6)} → ${status.toUpperCase()}`);
  };

  const accept = (id: string) => transition(id, 'accepted');
  const startPrep = (id: string) => transition(id, 'preparing');
  const markReady = (id: string) => transition(id, 'ready');
  const markDelayed = (id: string) => transition(id, 'delayed');
  const served = (id: string) => transition(id, 'completed');

  // ── Dedup undo / reorder helper ──────────────────────────────────────────

  const undoLast = () => setLastAction('');

  // ── Prep timer (side-effect: auto-flag delay) ──────────────────────────────

  // ── Derived data ──────────────────────────────────────────────────────────

  const statuses: OrderStatus[] = ['new', 'accepted', 'preparing', 'ready', 'delayed', 'completed'];
  const statusLabels: Record<OrderStatus, string> = {
    new: 'NEW', accepted: 'ACKD', preparing: 'COOKING', ready: 'READY', delayed: 'DELAYED', completed: 'DONE',
  };
  const statusColors: Record<OrderStatus, string> = {
    new: '#f04e31', accepted: '#ff9800', preparing: '#2196f3',
    ready: '#4caf50', delayed: '#ff4444', completed: '#999',
  };

  const counts = Object.fromEntries(statuses.map((s) => [s, orders.filter((o) => o.status === s).length])) as Record<OrderStatus, number>;

  const groupedOrders = batchMode
    ? statuses.reduce((acc, s) => { acc[s] = orders.filter((o) => o.status === s); return acc; }, {} as Record<OrderStatus, Order[]>)
    : null;

  // ── Alert sound player (for pre-played sounds) ─────────────────────────────

  const tryPlay = (base64: string) => {
    const el = new Audio(`data:audio/wav;base64,${base64}`);
    el.play().catch(() => {});
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ backgroundColor: '#1a1a2e', color: 'white', minHeight: '100vh', paddingBottom: 80 }}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 16px', backgroundColor: '#16162a',
        borderBottom: '1px solid #333',
      }}>
        <h1 style={{ margin: 0, fontSize: '18px' }}>&#x1F525; KITCHEN DISPLAY</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          < button
            onClick={() => !audioEnabled ? setAudioEnabled(true) : squashSound('toggle')}
            title={audioEnabled ? 'Mute alerts' : 'Unmute alerts'}
            style={{ background: audioEnabled ? '#333' : '#f04e31', border: 'none', borderRadius: 6, padding: '4px 10px', color: 'white', cursor: 'pointer', fontSize: '13px' }}
          >
            {audioEnabled ? '🔊' : '🔇'}
          </button>
          <div style={{ background: '#00ff88', color: '#000', padding: '4px 14px', borderRadius: 20, fontWeight: 'bold', fontSize: '13px' }}>
            {orders.length} orders
          </div>
          <Button
            label={batchMode ? '□ Batch' : '⊞ Batch'}
            onClick={() => setBatchMode(!batchMode)}
            style={{ padding: '4px 12px', fontSize: '13px' }}
          />
          <Button
            label="↩ Undo"
            onClick={undoLast}
            style={{ padding: '4px 10px', fontSize: '13px' }}
            variant="secondary"
          />
        </div>
      </div>

      {/* ── Status bar strip ───────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 6, padding: '8px 16px', backgroundColor: '#1e1e38', overflowX: 'auto' }}>
        {statuses.map((s) => (
          <span
            key={s}
            style={{
              minWidth: 80, textAlign: 'center', padding: '6px 10px', borderRadius: 6,
              backgroundColor: `${statusColors[s]}22`, border: `1px solid ${statusColors[s]}66`,
              color: statusColors[s], fontSize: '11px', fontWeight: 'bold',
            }}
          >
            {statusLabels[s]} ({counts[s]})
          </span>
        ))}
      </div>

      {/* ── New-order sound overlay (fires immediately) ────────────────────── */}
      {activeSounds.length > 0 && (
        <div
          style={{
            position: 'fixed', top: 12, right: 12, zIndex: 9999,
            display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end',
          }}
        >
          {activeSounds.map((id) => (
            <div
              key={id}
              role="button"
              tabIndex={0}
              onClick={() => { tryPlay('UklGRl9vT19XQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YU9vT18='); squashSound(id); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { tryPlay(''); squashSound(id); } }}
              style={{
                background: '#f04e31', color: 'white', padding: '12px 20px',
                borderRadius: 8, fontWeight: 'bold', fontSize: '15px',
                animation: 'kdsPulse 0.8s ease-in-out infinite',
                cursor: 'pointer', border: '2px solid #fff',
                boxShadow: '0 0 20px rgba(240,78,49,0.7)',
              }}
            >
              🚨 NEW ORDER — Tap to dismiss
            </div>
          ))}
        </div>
      )}

      {/* ── Last action toast ───────────────────────────────────────────────── */}
      {lastAction && (
        <div style={{ position: 'fixed', top: 60, right: 16, zIndex: 999, background: 'rgba(0,0,0,0.7)', color: 'white', padding: '6px 14px', borderRadius: 6, fontSize: '13px' }}>
          {lastAction}
        </div>
      )}

      {/* ── Tab bar ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, padding: '8px 16px', borderBottom: '1px solid #333' }}>
        {(['kitchen', 'inventory'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              flex: 1, padding: '8px 0', border: 'none', borderRadius: 6,
              background: activeTab === t ? '#3a3a6a' : 'transparent',
              color: 'white', fontWeight: activeTab === t ? 'bold' : 'normal',
              cursor: 'pointer', fontSize: '14px', textTransform: 'capitalize',
            }}
          >
            {t === 'kitchen' ? '🔥 Kitchen' : '📦 Inventory'}
          </button>
        ))}
      </div>

      {/* ── KITCHEN TAB ───────────────────────────────────────────────────── */}
      {activeTab === 'kitchen' && (
        <>
          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, padding: '12px 16px' }}>
            {statuses.map((s) => (
              <div key={s} style={{ textAlign: 'center', backgroundColor: '#2a2a4a', borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 22, fontWeight: 'bold', color: statusColors[s] }}>{counts[s]}</div>
                <div style={{ fontSize: 10, color: '#aaa', textTransform: 'uppercase' }}>{statusLabels[s]}</div>
              </div>
            ))}
          </div>

          {/* Batch grouping or flat list */}
          {groupedOrders ? (
            <>
              {statuses.map((s) => {
                const group = groupedOrders[s];
                if (!group?.length) return null;
                const overdue = group.filter((o) => s === 'preparing' && isDelayed(o)).length;
                return (
                  <div key={s} style={{ padding: '8px 16px' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      color: statusColors[s], fontWeight: 'bold', fontSize: '12px',
                      marginBottom: 8, textTransform: 'uppercase',
                    }}>
                      <span style={{
                        display: 'inline-block', width: 10, height: 10, borderRadius: '50%',
                        backgroundColor: statusColors[s],
                      }}
                      />
                      {statusLabels[s]} — {group.length} orders
                      {overdue > 0 && <span style={{ color: '#ff4444', marginLeft: 6 }}>&#9888; {overdue} DELAYED</span>}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
                      {group.map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          onAccept={() => accept(order.id)}
                          onStartPrep={() => startPrep(order.id)}
                          onReady={() => markReady(order.id)}
                          onDelay={() => markDelayed(order.id)}
                          onServed={() => served(order.id)}
                          onPark={() => setLastAction(`#${order.orderNumber} parked`)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12, padding: '12px 16px' }}>
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onAccept={() => accept(order.id)}
                  onStartPrep={() => startPrep(order.id)}
                  onReady={() => markReady(order.id)}
                  onDelay={() => markDelayed(order.id)}
                  onServed={() => served(order.id)}
                  onPark={() => setLastAction(`#${order.orderNumber} parked`)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── INVENTORY TAB ──────────────────────────────────────────────────── */}
      {activeTab === 'inventory' && (
        <div style={{ padding: '16px' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', marginBottom: 12,
          }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>&#x1F4E6; Stock Levels</h3>
            <span style={{ color: '#aaa', fontSize: '13px' }}>{inventory.filter((i) => i.inStock <= i.threshold).length} low</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
            {inventory.map((item) => {
              const pct = Math.min(100, (item.inStock / item.threshold) * 100);
              const isLow = item.inStock <= item.threshold;
              return (
                <div key={item.id} style={{
                  background: '#2a2a4a', borderRadius: 8, padding: '12px 16px',
                  border: isLow ? '2px solid #ff4444' : '2px solid #333',
                }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{item.name}</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: isLow ? '#ff4444' : '#4caf50' }}>
                    {item.inStock} <span style={{ fontSize: 14, color: '#aaa' }}>units</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#aaa', marginBottom: 8 }}>
                    Threshold: {item.threshold}
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: isLow ? '#ff4444' : '#4caf50', opacity: 0.3 }} />
                  <div style={{ height: 6, borderRadius: 3, marginTop: -6, width: `${pct}%`, background: isLow ? '#ff4444' : '#4caf50', transition: 'width 0.3s' }} />
                  {isLow && (
                    <div style={{ color: '#ff4444', fontSize: '12px', marginTop: 6, fontWeight: 'bold' }}>
                      &#9888; LOW STOCK — Restock urgently
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add / deduct stock buttons */}
          <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button
              label="+ Add Stock"
              onClick={() => setInventory((prev) => prev.map((i) => ({ ...i, inStock: i.inStock + 10 })))}
            />
            <Button
              label="− Use Stock"
              onClick={() => !confirm('Deduct 1 from all low-stock items?') || setInventory((prev) => prev.map((i) => ({ ...i, inStock: Math.max(0, i.inStock - 1) })))}
              variant="secondary"
            />
          </div>
        </div>
      )}

      {/* ── Bottom nav ─────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: 52, backgroundColor: '#16162a',
        borderTop: '1px solid #333', display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      }}>
           {[
             { key: 'kitchen', label: 'Kitchen', emoji: '🔥' },
             { key: 'inventory', label: 'Inventory', emoji: '📦' },
           ].map((t) => (
             <div
               key={t.key}
               onClick={() => setActiveTab(t.key)}
               style={{
                 display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer',
                 color: activeTab === t.key ? '#f04e31' : '#666', fontSize: '10px',
               }}
             >
               <span style={{ fontSize: '20px' }}>{t.emoji}</span>
               <span>{t.label}</span>
             </div>
           ))}
      </nav>

      {/* ── Pulse keyframes injected via style tag ── */}
      <style>{`
        @keyframes kdsPulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.04); }
        }
      `}</style>
    </div>
  );
}

// ── Order Card sub-component ─────────────────────────────────────────────────

interface OrderCardProps extends React.HTMLAttributes<HTMLDivElement> {
  order: Order;
  onAccept: () => void;
  onStartPrep: () => void;
  onReady: () => void;
  onDelay: () => void;
  onServed: () => void;
  onPark: () => void;
}

const SERVICE_LABEL: Record<ServiceType, string> = {
  dine_in: 'DINE IN', takeaway: 'TAKEAWAY', delivery: 'DELIVERY',
};
const SERVICE_COLOR: Record<ServiceType, string> = {
  dine_in: '#9c27b0', takeaway: '#ff9800', delivery: '#2196f3',
};

function OrderCard({ order, onAccept, onStartPrep, onReady, onDelay, onServed, onPark }: OrderCardProps) {
  const mins = orderElapsed(order);
  const ots = (order.estPrepMins * 60000) - (mins * 60000);
  const delay = !!(order.status === 'preparing' && mins > order.estPrepMins);
  const progress = Math.min(100, Math.round((mins / order.estPrepMins) * 100));

  const serviceColor = SERVICE_COLOR[order.serviceType];

  return (
    <div style={{
      backgroundColor: delay ? '#3b1a1a' : '#2a2a4a',
      borderRadius: 10, border: `2px solid ${delay ? '#ff4444' : statusColor(order.status)}`,
      padding: 14, display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 'bold' }}>#{order.orderNumber}</div>
          <div style={{ fontSize: 12, color: '#aaa' }}>
            {order.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <span style={{
          background: `${serviceColor}33`, color: serviceColor, padding: '3px 10px',
          borderRadius: 12, fontSize: '11px', fontWeight: 'bold', border: `1px solid ${serviceColor}66`,
        }}>
          {SERVICE_LABEL[order.serviceType]}
        </span>
      </div>

      {/* Diner / table */}
      {order.table && (
        <div style={{ fontSize: 13, color: '#ddd' }}>Guest: {order.diner} &middot; {order.table}</div>
      )}

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '13px', color: '#eee' }}>
        {order.items.map((item) => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <span style={{ fontWeight: 'bold', minWidth: 20 }}>{item.qty}x</span>
            <span style={{ flex: 1, fontWeight: 500 }}>{item.name}</span>
            {item.modifiers?.length ? (
              <span style={{ fontSize: 11, color: '#aaa' }}>&#x2022; {item.modifiers.join(', ')}</span>
            ) : null}
            {item.note && (
              <span style={{ fontSize: 11, color: '#ff9800', fontStyle: 'italic', width: '100%' }}>&#x1F4DD; {item.note}</span>
            )}
          </div>
        ))}
      </div>

      {/* Timer + delay ──── only when preparing or delayed */}
      {(order.status === 'preparing' || order.status === 'delayed') && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: 4 }}>
            <span style={{ color: delay ? '#ff4444' : '#aaa' }}>
              &#9200; {mins}m / ~{order.estPrepMins}m &nbsp;
              {delay && <span style={{ fontWeight: 'bold', color: '#ff4444' }}>&#x26A0; DELAYED</span>}
              {!delay && <span>{ots > 0 ? `${Math.ceil(ots / 60000)}m left` : 'Nearing done'}</span>}
            </span>
          </div>
          <div style={{ height: 6, borderRadius: 3, backgroundColor: '#444', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%', width: `${Math.min(progress, 100)}%`,
                backgroundColor: delay ? '#ff4444' : '#4caf50',
                transition: 'width 1s linear', borderRadius: 3,
              }}
            />
          </div>
        </div>
      )}

      {/* Action buttons ── transition through the workflow */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
        {order.status === 'new' && (
          <Button label="✓ Accept" onClick={onAccept} style={{ flex: 1, minWidth: 80 }} />
        )}
        {order.status === 'accepted' && (
          <Button label="⏱ Start Prep" onClick={onStartPrep} style={{ flex: 1, minWidth: 100 }} />
        )}
        {order.status === 'preparing' && (
          <>
            {delay && <Button label="⏰ Still Cooking" onClick={onDelay} style={{ flex: 1, minWidth: 100 }} variant="secondary" />}
            <Button label="✓ Ready" onClick={onReady} style={{ flex: 1, minWidth: 80 }} />
          </>
        )}
        {order.status === 'ready' && (
          <Button label="✅ Served" onClick={onServed} style={{ flex: 1, minWidth: 80 }} />
        )}
        {(order.status === 'new' || order.status === 'accepted') && (
          <Button
            label="✕ Park"
            onClick={onPark}
            variant="secondary"
            style={{ flex: 0 }} />
        )}
      </div>
    </div>
  );
}

function statusColor(s: OrderStatus): string {
  const colors: Record<OrderStatus, string> = {
    new: '#f04e31', accepted: '#ff9800', preparing: '#2196f3',
    ready: '#4caf50', delayed: '#ff4444', completed: '#444',
  };
  return colors[s];
}
