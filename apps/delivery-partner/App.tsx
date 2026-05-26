import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Switch, Alert, Dimensions } from 'react-native';
import { io, Socket } from 'socket.io-client';

const { width: SCREEN_W } = Dimensions.get('window');

// ── Types ─────────────────────────────────────────────────────────────────────

type DeliveryStatus = 'idle' | 'assigned' | 'navigating_to_pickup' | 'at_pickup' | 'navigating_to_drop' | 'completed';

interface Order {
  id: string;
  orderNumber: string;
  restaurant: { name: string; address: string; phone: string };
  customer: { name: string; address: string; phone: string };
  amount: number;
  distanceKm: number;
  otp: string;
  status: DeliveryStatus;
  acceptedAt?: Date;
  pickedUpAt?: Date;
}

interface DailyEarnings {
  today: number;
  pending: number;
  bonus: number;
  ordersToday: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DRIVER_NAME = 'Raj Kumar';
const VEHICLE = 'Bajaj Dominar 400 | DL8CAB 7890';
const DEFAULT_OTP = '234567';

const issueTypes = [
  { icon: '🚧', label: 'Road Blocked' },
  { icon: '📵', label: 'No Response' },
  { icon: '🔋', label: 'Battery Low' },
  { icon: '🍽️', label: 'Food Stuck' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtTime(d?: Date) {
  return d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
}

function timeAgo(d?: Date) {
  if (!d) return '';
  const mins = Math.floor((+new Date() - +d) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

// ── Mock incoming order ───────────────────────────────────────────────────────

function demoIncoming(): Order {
  return {
    id: `ord-${Date.now()}`,
    orderNumber: `SG-${Date.now().toString(36).toUpperCase()}`,
    restaurant: { name: 'Burger King — Mohali', address: 'Phase 5, Mohali', phone: '+91 98765 43210' },
    customer: { name: 'Amit Verma', address: 'Sector 71, Mohali', phone: '+91 91234 56789' },
    amount: 68,
    distanceKm: 4.2,
    otp: DEFAULT_OTP,
    status: 'assigned',
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DriverApp() {
  const [isOnline, setIsOnline] = useState(false);
  const [incomingOrder, setIncomingOrder] = useState<Order | null>(null);
  const [activeDelivery, setActiveDelivery] = useState<Order | null>(null);
  const [earnings, setEarnings] = useState<DailyEarnings>({ today: 1450, pending: 350, bonus: 200, ordersToday: 8 });
  const [socket, setSocket] = useState<Socket | null>(null);
  const [deliveryOtp, setDeliveryOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [log, setLog] = useState<string[]>([]);
  const [expandedIssue, setExpandedIssue] = useState(false);
  const [activeScreen, setActiveScreen] = useState<'home' | 'earnings'>('home');

  const addLog = (msg: string) => setLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 9)]);

  // ── Socket ───────────────────────────────────────────────────────────────

  useEffect(() => {
    const s: Socket = io('http://localhost:3001', {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
    });
    setSocket(s);

    s.on('connect', () => addLog('Connected to backend'));
    s.on('disconnect', () => addLog('Disconnected'));
    s.on('orderAssigned', (order: Order) => {
      if (isOnline) { setIncomingOrder(order); addLog(`New order: #${order.orderNumber} (₹${order.amount})`); }
    });
    return () => { s.disconnect(); };
  }, [isOnline]);

  useEffect(() => {
    if (!isOnline) { socket?.emit('driverOffline'); return; }
    socket?.emit('driverOnline', { name: DRIVER_NAME, vehicle: VEHICLE });
    addLog('Went online — awaiting orders');
    return () => { socket?.emit('driverOffline'); };
  }, [isOnline, socket]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const acceptOrder = () => {
    if (!incomingOrder) return;
    const accepted = { ...incomingOrder, status: 'assigned' as const, acceptedAt: new Date() };
    setActiveDelivery(accepted);
    setIncomingOrder(null);
    setEarnings((prev) => ({ ...prev, pending: prev.pending + accepted.amount }));
    addLog(`Accepted #${accepted.orderNumber}`);
    Alert.alert('🎉 Order Accepted', `Heading to ${accepted.restaurant.name}`);
  };

  const rejectOrder = () => {
    if (!incomingOrder) return;
    setIncomingOrder(null);
    addLog(`Rejected #${incomingOrder.orderNumber}`);
    socket?.emit('orderRejected', { orderId: incomingOrder.id, reason: 'declined_by_driver' });
  };

  const navigateTo = (destination: string, addr: string) => {
    Alert.alert('🚗 Navigation', `Opening maps to ${destination}: ${addr}.\n(In production, this opens Google Maps.)`);
    addLog(`Navigating → ${destination}`);
  };

  const confirmPickup = () => {
    if (!activeDelivery) return;
    setDeliveryOtp(DEFAULT_OTP); // auto-fill for demo
    addLog(`Arrived at pickup: ${activeDelivery.restaurant.name}`);
  };

  const verifyOtpAndPickup = () => {
    if (!activeDelivery) return;
    if (deliveryOtp !== activeDelivery.otp) {
      setOtpError('Invalid OTP — ask the customer');
      addLog('OTP verification failed');
      return;
    }
    setOtpError('');
    const picked: Order = { ...activeDelivery, status: 'navigating_to_drop' as const, pickedUpAt: new Date() };
    setActiveDelivery(picked);
    addLog(`OTP verified — picked up #${picked.orderNumber}`);
    Alert.alert('✅ Pickup Confirmed', 'Navigate to customer now!');
  };

  const completeDelivery = () => {
    if (!activeDelivery) return;
    setEarnings((prev) => ({
      ...prev,
      today: prev.today + activeDelivery.amount,
      ordersToday: prev.ordersToday + 1,
      pending: prev.pending - activeDelivery.amount,
    }));
    addLog(`Delivered #${activeDelivery.orderNumber} — +₹${activeDelivery.amount}`);
    Alert.alert('✅ Delivered!', `+₹${activeDelivery.amount} added to today's earnings`);
    setActiveDelivery(null);
    setDeliveryOtp('');
  };

  const reportIssue = (label: string) => {
    addLog(`Issue reported: ${label}`);
    socket?.emit('driverIssue', { orderId: activeDelivery?.id, issue: label });
    Alert.alert('Issue Reported', `${label} — Support has been notified.`);
    setExpandedIssue(false);
  };

  // ── Derived ──────────────────────────────────────────────────────────────

  const statusLabel: Record<string, string> = {
    idle: '✋ IDLE',
    assigned: '📋 ASSIGNED',
    navigating_to_pickup: '🛵 → PICKUP',
    at_pickup: '🏪 AT PICKUP',
    navigating_to_drop: '🛵 → CUSTOMER',
    completed: '🏁 DONE',
  };

  const statusIdx = (s: DeliveryStatus) => ['idle','assigned','navigating_to_pickup','at_pickup','navigating_to_drop','completed'].indexOf(activeDelivery?.status || 'idle');

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🛵 SpiceGarden Driver</Text>
          <Text style={styles.subtitle}>{DRIVER_NAME}</Text>
          <Text style={styles.vehicleTag}>{VEHICLE}</Text>
        </View>
        <View style={styles.onlineToggle}>
          <Text style={isOnline ? styles.onlineText : styles.offlineText}>
            {isOnline ? '● ONLINE' : '● OFFLINE'}
          </Text>
          <Switch value={isOnline} onValueChange={setIsOnline}
            trackColor={{ false: '#555', true: '#4caf50' }}
            thumbColor="white" />
        </View>
      </View>

      {/* ── Quick stats row ───────────────────────────────────────────────── */}
      <View style={styles.statsRow}>
        <StatCard label="Today" value={`₹${earnings.today}`} sub={`${earnings.ordersToday} orders`} />
        <StatCard label="Pending" value={`₹${earnings.pending}`} sub="to be credited" />
        <StatCard label="Bonus" value={`₹${earnings.bonus}`} sub="weekly" />
      </View>

      {/* ── Tab switcher ──────────────────────────────────────────────────── */}
      <View style={styles.tabRow}>
        {(['home', 'earnings'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setActiveScreen(t)}
            style={[styles.tab, activeScreen === t && styles.tabActive]}
          >
            <Text style={[styles.tabLabel, activeScreen === t && styles.tabLabelActive]}>
              {t === 'home' ? '🏠 Active' : '💰 Earnings'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── HOME SCREEN ───────────────────────────────────────────────────── */}
      {activeScreen === 'home' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

          {/* ── Incoming order alert ─────────────────────────────────────── */}
          {incomingOrder ? (
            <View style={styles.incomingCard}>
              <View style={styles.alertBanner}>
                <Text style={styles.alertBannerText}>🚨 NEW ORDER ARRIVED</Text>
              </View>

              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle}>#{incomingOrder.orderNumber}</Text>
                <Text style={styles.amountBadge}>+₹{incomingOrder.amount}</Text>
              </View>

              <DetailRow label="Pick up from:" value={`${incomingOrder.restaurant.name} (${incomingOrder.restaurant.address})`} />
              <DetailRow label="Deliver to:" value={`${incomingOrder.customer.address}`} />
              <DetailRow label="Distance:" value={`${incomingOrder.distanceKm} km`} />
              <DetailRow label="Order ID OTP:" value={`${incomingOrder.otp}`} />

              <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.btn, styles.btnReject]} onPress={rejectOrder}>
                  <Text style={styles.btnText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.btnAccept]} onPress={acceptOrder}>
                  <Text style={styles.btnText}>✅ Accept</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {/* ── Active delivery ───────────────────────────────────────────── */}
          {!incomingOrder && activeDelivery ? (
            <View style={styles.activeCard}>
              <Text style={styles.cardTitle}>🚚 Active Delivery</Text>

              {/* Status progress */}
              <View style={styles.progressContainer}>
                {['assigned','navigating_to_pickup','at_pickup','navigating_to_drop','completed'].map((s, i) => {
                  const currentStatus = activeDelivery.status;
                  const steps = ['assigned','navigating_to_pickup','at_pickup','navigating_to_drop','completed'];
                  const activeIdx = steps.indexOf(currentStatus);
                  const past = i <= activeIdx;
                  return (
                    <React.Fragment key={s}>
                      <View style={{ alignItems: 'center', flex: 1 }}>
                        <View style={[styles.progressDot, past ? styles.progressDotActive : styles.progressDotInactive]}>
                          {past ? <Text style={styles.progressDotText}>✓</Text> : <Text style={[styles.progressDotText, { color: '#666' }]}>{i + 1}</Text>}
                        </View>
                        <Text style={[styles.progressLabel, past && { color: '#fff', fontWeight: 'bold' }]}>
                          {s === 'navigating_to_pickup' ? '→Pickup' : s === 'navigating_to_drop' ? '→Drop' : s.replace('_', ' ')}
                        </Text>
                      </View>
                      {i < 4 && <View style={[styles.progressLine, activeIdx >= i && styles.progressLineActive]} />}
                    </React.Fragment>
                  );
                })}
              </View>

              {/* Restaurant / Customer context */}
              <View style={styles.contextCards}>
                <View style={styles.contextCard}>
                  <Text style={styles.contextLabel}>🏪 PICKUP</Text>
                  <Text style={styles.contextName}>{activeDelivery.restaurant.name}</Text>
                  <Text style={styles.contextAddr}>{activeDelivery.restaurant.address}</Text>
                </View>
                <View style={styles.contextCard}>
                  <Text style={styles.contextLabel}>📍 DROP</Text>
                  <Text style={styles.contextName}>{activeDelivery.customer.name}</Text>
                  <Text style={styles.contextAddr}>{activeDelivery.customer.address}</Text>
                  <Text style={styles.contextPhone}>📞 {activeDelivery.customer.phone}</Text>
                </View>
              </View>

              {/* Dynamic action buttons */}
              {activeDelivery.status === 'assigned' && (
                <TouchableOpacity
                  style={styles.navBtn}
                  onPress={() => navigateTo('restaurant', activeDelivery.restaurant.name)}
                >
                  <Text style={styles.navBtnText}>📍 Navigate to Pickup</Text>
                </TouchableOpacity>
              )}

              {activeDelivery.status === 'navigating_to_pickup' && (
                <>
                  <TouchableOpacity style={styles.arriveBtn} onPress={confirmPickup}>
                    <Text style={styles.navBtnText}>🏪 I'm at Restaurant</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.navBtn}
                    onPress={() => navigateTo('restaurant', activeDelivery.restaurant.name)}
                  >
                    <Text style={styles.navBtnText}>📍 Open Navigation</Text>
                  </TouchableOpacity>
                </>
              )}

              {activeDelivery.status === 'at_pickup' && (
                <View style={{ gap: 10 }}>
                  <Text style={{ color: '#aaa', fontSize: 13, textAlign: 'center' }}>
                    Verify OTP with staff / customer before leaving
                  </Text>
                  <View style={styles.otpRow}>
                    {Array.from({ length: 6 }, (_, i) => (
                      <View key={i} style={styles.otpSlot}>
                        <Text style={styles.otpChar}>({deliveryOtp[i] || '—'})</Text>
                      </View>
                    ))}
                  </View>
                  <TouchableOpacity style={[styles.btn, { backgroundColor: '#ff9800', flex: 1 }]} onPress={() => setDeliveryOtp(activeDelivery.otp)}>
                    <Text style={styles.btnText}>📋 Auto-fill OTP</Text>
                  </TouchableOpacity>
                  {otpError ? <Text style={styles.otpError}>{otpError}</Text> : null}

                  <View style={styles.actionRow}>
                    <TouchableOpacity style={[styles.btn, styles.btnReject]} onPress={() => setOtpError('')}>
                      <Text style={styles.btnText}>Clear</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, styles.btnAccept]} onPress={verifyOtpAndPickup}>
                      <Text style={styles.btnText}>✅ Confirm OTP</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {activeDelivery.status === 'navigating_to_drop' && (
                <View style={{ gap: 10 }}>
                  <TouchableOpacity
                    style={styles.navBtn}
                    onPress={() => navigateTo('customer', activeDelivery.customer.address)}
                  >
                    <Text style={styles.navBtnText}>📍 Navigate to Customer</Text>
                  </TouchableOpacity>
                  <DetailRow label="Customer:" value={`${activeDelivery.customer.name}`} />
                  <DetailRow label="Address:" value={`${activeDelivery.customer.address}`} />
                  <DetailRow label="Phone:" value={`${activeDelivery.customer.phone}`} />
                  <TouchableOpacity style={styles.completeBtn} onPress={completeDelivery}>
                    <Text style={styles.navBtnText}>🏁 Mark Delivered</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : null}

          {/* ── Idle state ────────────────────────────────────────────────── */}
          {!incomingOrder && !activeDelivery && (
            <View style={styles.idleCard}>
              <Text style={styles.idleIcon}>⏳</Text>
              <Text style={styles.idleText}>
                {isOnline ? 'Waiting for orders…' : 'Go online to receive orders'}
              </Text>
              {isOnline && (
                <TouchableOpacity
                  style={styles.btnAccept}
                  onPress={() => {
                    const demo = demoIncoming();
                    setIncomingOrder(demo);
                    addLog('Demo order injected');
                  }}
                >
                  <Text style={styles.btnText}>⚡ Demo Incoming Order</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* ── Issue reporting ───────────────────────────────────────────── */}
          {activeDelivery && (
            <View style={styles.issueSection}>
              <TouchableOpacity
                onPress={() => setExpandedIssue(!expandedIssue)}
                style={styles.issueToggle}
              >
                <Text style={styles.issueToggleText}>⚠️ Report an Issue</Text>
                <Text style={styles.issueChevron}>{expandedIssue ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {expandedIssue && (
                <View style={styles.issueGrid}>
                  {issueTypes.map((issue) => (
                    <TouchableOpacity
                      key={issue.label}
                      style={styles.issueBtn}
                      onPress={() => reportIssue(issue.label)}
                    >
                      <Text style={{ fontSize: 22 }}>{issue.icon}</Text>
                      <Text style={styles.issueLabel}>{issue.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* ── Activity log ──────────────────────────────────────────────── */}
          {log.length > 0 && (
            <View style={styles.logCard}>
              <Text style={styles.logTitle}>📋 Recent Activity</Text>
              {log.map((entry, i) => (
                <Text key={i} style={[styles.logEntry, i === 0 && styles.logEntryNew]}>
                  {entry}
                </Text>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* ── EARNINGS SCREEN ────────────────────────────────────────────────── */}
      {activeScreen === 'earnings' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.earnBigCard}>
            <Text style={styles.earnLabel}>Today's Earnings</Text>
            <Text style={styles.earnAmount}>₹{earnings.today}</Text>
            <Text style={styles.earnSub}>{earnings.ordersToday} deliveries completed</Text>
          </View>

          <View style={styles.earnGrid}>
            <StatCard label="Pending" value={`₹${earnings.pending}`} sub="yet to credit" />
            <StatCard label="Weekly Bonus" value={`₹${earnings.bonus}`} sub="on-time reward" />
            <StatCard label="Rating" value="⭐ 4.8" sub="lifetime" />
            <StatCard label="Acceptance" value="97%" sub="this month" />
          </View>

          <Card title="🏆 Performance" sub="This week">
            <View style={{ gap: 8 }}>
              <EarnRow label="On-time deliveries" value="184 / 190" pct={97} />
              <EarnRow label="Customer rating" value="4.8 / 5.0" pct={96} />
              <EarnRow label="Acceptance rate" value="97%" pct={97} />
              <EarnRow label="Completed orders" value="42 / week" pct={88} />
            </View>
          </Card>
        </ScrollView>
      )}
    </View>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statSub}>{sub}</Text>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', paddingVertical: 3 }}>
      <Text style={{ color: '#888', minWidth: 100, fontSize: 12 }}>{label}</Text>
      <Text style={{ color: '#fff', flex: 1, fontSize: 12 }} numberOfLines={1} ellipsizeMode="tail">{value}</Text>
    </View>
  );
}

function EarnRow({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ color: '#ccc', fontSize: 13 }}>{label}</Text>
        <Text style={{ color: '#4caf50', fontWeight: 'bold', fontSize: 13 }}>{value}</Text>
      </View>
      <View style={{ height: 6, borderRadius: 3, backgroundColor: '#333', overflow: 'hidden' }}>
        <View style={{ height: '100%', width: `${pct}%`, backgroundColor: '#4caf50', borderRadius: 3 }} />
      </View>
    </View>
  );
}

function Card({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {sub && <Text style={styles.cardSubtitle}>{sub}</Text>}
      {children}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: 16, backgroundColor: '#1a1a1a', borderBottomWidth: 1, borderBottomColor: '#333',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#f04e31' },
  subtitle: { color: '#888', fontSize: 13, marginTop: 2 },
  vehicleTag: { color: '#555', fontSize: 11, marginTop: 1 },
  onlineToggle: { flexDirection: 'row', alignItems: 'center' },
  onlineText: { color: '#4caf50', marginRight: 8, fontWeight: 'bold', fontSize: 14 },
  offlineText: { color: '#f44336', marginRight: 8, fontWeight: 'bold', fontSize: 14 },

  statsRow: { flexDirection: 'row', padding: 12, gap: 10 },
  statCard: {
    flex: 1, backgroundColor: '#1e1e1e', borderRadius: 10, padding: 12,
    alignItems: 'center',
  },
  statLabel: { fontSize: 11, color: '#888', textTransform: 'uppercase' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginVertical: 2 },
  statSub: { fontSize: 11, color: '#555' },

  tabRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 8, backgroundColor: '#161616' },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 6, alignItems: 'center' },
  tabActive: { backgroundColor: '#2a2a4a', borderBottomWidth: 2, borderBottomColor: '#f04e31' },
  tabLabel: { color: '#666', fontSize: 13 },
  tabLabelActive: { color: '#f04e31', fontWeight: 'bold' },

  content: { flex: 1 },

  incomingCard: {
    margin: 14, backgroundColor: '#1e1a1a', borderRadius: 14,
    borderWidth: 2, borderColor: '#f04e31', overflow: 'hidden',
  },
  alertBanner: {
    backgroundColor: '#f04e31', paddingVertical: 8, alignItems: 'center',
  },
  alertBannerText: { color: 'white', fontWeight: 'bold', fontSize: 13, letterSpacing: 1.5 },

  activeCard: {
    margin: 14, backgroundColor: '#1a1e1a', borderRadius: 14,
    borderWidth: 2, borderColor: '#4caf50', padding: 16,
  },

  idleCard: {
    margin: 20, backgroundColor: '#1a1e2e', borderRadius: 14,
    borderWidth: 1, borderColor: '#2a3a5a', alignItems: 'center', padding: 32,
  },
  idleIcon: { fontSize: 48, marginBottom: 12 },
  idleText: { color: '#666', marginBottom: 20, fontSize: 15 },

  progressContainer: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    justifyContent: 'space-between',
  },
  progressDot: {
    width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', zIndex: 2,
  },
  progressDotActive: { backgroundColor: '#4caf50' },
  progressDotInactive: { backgroundColor: '#333' },
  progressDotText: { fontSize: 11, color: 'white', fontWeight: 'bold' },
  progressLine: { flex: 1, height: 3, backgroundColor: '#333', marginHorizontal: 4 },
  progressLineActive: { backgroundColor: '#4caf50' },
  progressLabel: { fontSize: 10, textAlign: 'center', color: '#666', marginTop: 3, maxWidth: 50 },

  contextCards: { flexDirection: 'row', gap: 10, marginVertical: 12 },
  contextCard: {
    flex: 1, backgroundColor: '#222', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#333',
  },
  contextLabel: { fontSize: 10, color: '#888', textTransform: 'uppercase', marginBottom: 4 },
  contextName: { fontSize: 14, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
  contextAddr: { fontSize: 12, color: '#aaa' },
  contextPhone: { fontSize: 12, color: '#4caf50', marginTop: 4 },

  navBtn: {
    backgroundColor: '#2196f3', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8,
  },
  arriveBtn: { backgroundColor: '#ff9800', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  completeBtn: { backgroundColor: '#4caf50', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },

  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginVertical: 12 },
  otpSlot: {
    width: 40, height: 48, borderRadius: 6, backgroundColor: '#1e1e1e',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#444',
  },
  otpChar: { fontSize: 18, fontWeight: 'bold', color: '#f04e31' },
  otpError: { color: '#ff4444', textAlign: 'center', fontSize: 13 },

  issueSection: {
    marginHorizontal: 14, marginBottom: 14, backgroundColor: '#1e1a1a',
    borderRadius: 10, borderWidth: 1, borderColor: '#333',
  },
  issueToggle: {
    flexDirection: 'row', justifyContent: 'space-between', padding: 14,
    alignItems: 'center', backgroundColor: '#2a1a1a',
    borderTopLeftRadius: 10, borderTopRightRadius: 10,
    borderBottomWidth: 1, borderBottomColor: '#333',
  },
  issueToggleText: { color: '#ff9800', fontWeight: 'bold', fontSize: 14 },
  issueChevron: { color: '#ff9800', fontSize: 12, marginLeft: 8 },
  issueGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 10, gap: 8 },
  issueBtn: {
    width: (SCREEN_W - 52) / 4, backgroundColor: '#2a2a2a', borderRadius: 8,
    alignItems: 'center', paddingVertical: 10,
  },
  issueLabel: { color: '#ccc', fontSize: 11, marginTop: 4, textAlign: 'center' },

  logCard: {
    margin: 14, padding: 14, backgroundColor: '#1a1e2a',
    borderRadius: 10, borderWidth: 1, borderColor: '#2a3a5a',
  },
  logTitle: { color: '#aaa', fontSize: 12, marginBottom: 8, fontWeight: 'bold', textTransform: 'uppercase' },
  logEntry: { color: '#666', fontSize: 11, fontFamily: 'monospace', paddingVertical: 1 },
  logEntryNew: { color: '#4caf50' },

  earnBigCard: {
    margin: 14, padding: 24, borderRadius: 14, alignItems: 'center',
    backgroundColor: '#1e3a1e',
    borderWidth: 2, borderColor: '#4caf50',
  },
  earnLabel: { color: '#888', fontSize: 14, textTransform: 'uppercase' },
  earnAmount: { fontSize: 48, fontWeight: 'bold', color: '#4caf50', marginVertical: 8 },
  earnSub: { color: '#aaa', fontSize: 14 },
  earnGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14, gap: 10, paddingBottom: 14 },

  card: {
    margin: 14, padding: 16, backgroundColor: '#1e1e1e', borderRadius: 12, borderWidth: 1, borderColor: '#333',
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  cardSubtitle: { fontSize: 13, color: '#888', marginBottom: 12 },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amountBadge: {
    background: '#1e3a1e', color: '#4caf50',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, fontSize: 16, fontWeight: 'bold',
  },

  actionRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  btn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  btnAccept: { backgroundColor: '#f04e31', flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  btnReject: { backgroundColor: '#444', flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
});
