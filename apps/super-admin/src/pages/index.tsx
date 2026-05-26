import React, { useState, useEffect, useCallback } from 'react';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { io, Socket } from 'socket.io-client';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar,
} from 'recharts';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface LiveOrder {
  id: string;
  amount: number;
  branch: string;
  eta: number;
  status: string;
  timestamp: number;
}

interface BranchStatus {
  name: string;
  status: 'operational' | 'delayed' | 'critical';
  orderCount: number;
  avgPrepMins: number;
  driversAssigned: number;
}

interface DisputeTicket {
  id: string;
  type: 'refund' | 'support' | 'fraud';
  user: string;
  amount?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  createdAt: string;
}

interface HeatmapPoint {
  x: number; y: number; intensity: number; label: string;
}

// Fetch real stats from API
async function fetchStats() {
  try {
    const res = await fetch(`${API_BASE}/admin/stats`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.error('Failed to fetch stats:', e);
  }
  return null;
}

// Fetch real orders from API
async function fetchOrders() {
  try {
    const res = await fetch(`${API_BASE}/orders`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.error('Failed to fetch orders:', e);
  }
  return [];
}

// ── Generate a realistic-looking delivery heatmap ──────────────────────────────

function generateHeatmap(): HeatmapPoint[] {
  const hotspots = [
    { cx: 30, cy: 40, r: 18 }, { cx: 70, cy: 25, r: 14 },
    { cx: 50, cy: 65, r: 20 }, { cx: 20, cy: 75, r: 10 },
    { cx: 80, cy: 60, r: 12 }, { cx: 45, cy: 30, r: 8 },
  ];
  const pts: HeatmapPoint[] = [];
  const labels = ['Sector 17', 'Sector 22', 'Mohali', 'Panchkula', 'Zirakpur', 'Chandigarh'];
  hotspots.forEach((h, i) => {
    for (let dx = -h.r; dx <= h.r; dx += 3) {
      for (let dy = -h.r; dy <= h.r; dy += 3) {
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= h.r) {
          const intensity = Math.max(0, 1 - dist / h.r);
          pts.push({ x: Math.min(95, Math.max(5, h.cx + dx)), y: Math.min(95, Math.max(5, h.cy + dy)), intensity, label: labels[i] });
        }
      }
    }
  });
  return pts;
}

// ── Heatmap grid renderer ─────────────────────────────────────────────────────

function DeliveryHeatmap({ data }: { data: HeatmapPoint[] }) {
  const GRID = 40;
  const buckets: Record<string, { sum: number; count: number }> = {};
  data.forEach((p) => {
    const key = `${Math.round(p.x / GRID) * GRID},${Math.round(p.y / GRID) * GRID}`;
    const b = buckets[key] || { sum: 0, count: 0 };
    buckets[key] = { sum: b.sum + p.intensity, count: b.count + 1 };
  });

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: `repeat(${100 / GRID}, 1fr)`,
      gap: 1, aspectRatio: '1', borderRadius: 8, overflow: 'hidden',
    }}>
      {Array.from({ length: (100 / GRID) * (100 / GRID) }, (_, i) => {
        const col = i % (100 / GRID);
        const row = Math.floor(i / (100 / GRID));
        const x = col * GRID;
        const y = row * GRID;
        const key = `${x},${y}`;
        const b = buckets[key];
        const avg = b ? b.sum / b.count : 0;
        const r = Math.round(220 + avg * 35);
        const g = Math.round(50 + avg * 20);
        const bv = Math.round(30);
        return (
          <div
            key={i}
            title={avg > 0.4 ? `High demand zone (intensity: ${avg.toFixed(2)})` : ''}
            style={{ backgroundColor: `rgba(${r},${g},${bv},${Math.max(0.06, avg)})`, borderRadius: 1 }}
          />
        );
      })}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

const SOCKET_URL = 'http://localhost:3001';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    revenue: 45200,
    orders: 124,
    driversOnline: 18,
    complaints: 3,
    refunds: 12,
    fraudAlerts: 3,
    activeBranches: 3,
    pendingWithdrawals: 8,
  });
  const [liveOrders, setLiveOrders] = useState<LiveOrder[]>([]);
  const [branches, setBranches] = useState<BranchStatus[]>([]);
  const [tickets, setTickets] = useState<DisputeTicket[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'orders' | 'branches' | 'support'>('overview');
  const [ticketFilter, setTicketFilter] = useState<'all' | DisputeTicket['type']>('all');

  // ── Fetch initial data ───────────────────────────────────────────────────
  useEffect(() => {
    fetchStats().then(data => {
      if (data) {
        setStats(prev => ({ ...prev, ...data.stats }));
        setRevenueData(data.revenueData || []);
        setBranches(data.branches || []);
        setTickets(data.tickets || []);
      }
    });
    fetchOrders().then(orders => {
      if (orders.length > 0) {
        setLiveOrders(orders.map((o: any) => ({ ...o, timestamp: new Date(o.createdAt).getTime() })));
      }
    });
  }, []);

// ── Socket ─────────────────────────────────────────────────────────────────
  
  useEffect(() => {
    const socket: Socket = io(SOCKET_URL, { path: '/socket.io/' });
    socket.on('connect', () => console.log('[Admin] connected'));
    socket.on('disconnect', () => console.log('[Admin] disconnected'));
    socket.on('statsUpdate', (s: any) => setStats((p) => ({ ...p, ...s })));
    socket.on('newOrderGlobal', (order: LiveOrder) =>
      setLiveOrders((prev) => [{ ...order, timestamp: Date.now() }, ...prev].slice(0, 20)),
    );
    socket.on('kitchenUpdate', setBranches);
    socket.on('deliveryHeatmap', setHeatmapData);
    socket.on('revenueUpdate', (d: any[]) => setRevenueData(d));
    return () => { socket.disconnect(); };
  }, []);

  // ── Filters ─────────────────────────────────────────────────────────────────

  const filteredTickets = ticketFilter === 'all'
    ? tickets
    : tickets.filter((t) => t.type === ticketFilter);

  const openTickets = tickets.filter((t) => t.severity === 'high' || t.severity === 'critical');
  const pendingRefunds = tickets.filter((t) => t.type === 'refund');

  // ── Format helpers ──────────────────────────────────────────────────────────

  const sevColor: Record<string, string> = {
    low: '#2196f3', medium: '#ff9800', high: '#ff4444', critical: '#9c27b0',
  };
  const branchStatusColor: Record<string, string> = {
    operational: '#4caf50', delayed: '#ff4444', critical: '#9c27b0',
  };
  const typeIcon: Record<string, string> = {
    refund: '💸', support: '🎧', fraud: '🛡️',
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <aside style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 220, background: '#1e2a3a',
        color: 'white', padding: '20px 0', display: 'flex', flexDirection: 'column', gap: 4, zIndex: 100,
      }}>
        <div style={{ padding: '0 20px 20px', borderBottom: '1px solid #2a3a4a' }}>
          <div style={{ fontSize: 17, fontWeight: 'bold', color: '#f04e31' }}>🌶️ SpiceGarden</div>
          <div style={{ fontSize: 11, color: '#7a8a9a', marginTop: 3 }}>Super Admin</div>
        </div>

        {[
          { key: 'overview', label: 'Dashboard', emoji: '📊' },
          { key: 'orders', label: 'Live Orders', emoji: '🛵' },
          { key: 'branches', label: 'Kitchen Monitor', emoji: '🏪' },
          { key: 'support', label: 'Support & Security', emoji: '🛡️' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setSelectedTab(t.key as typeof selectedTab)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', border: 'none',
              background: selectedTab === t.key ? '#f04e31' : 'transparent', color: 'white',
              fontSize: 14, cursor: 'pointer', textAlign: 'left', borderLeft: selectedTab === t.key ? '3px solid #fff' : '3px solid transparent',
            }}
          >
            <span style={{ fontSize: 16 }}>{t.emoji}</span> {t.label}
          </button>
        ))}

        <div style={{ flex: 1 }} />
        <div style={{ padding: '0 20px', borderTop: '1px solid #2a3a4a', paddingTop: 16 }}>
          <div style={{ fontSize: 13, color: '#7a8a9a' }}>Logged in as</div>
          <div style={{ fontSize: 13, fontWeight: 'bold', color: '#fff', marginTop: 2 }}>Super Admin</div>
        </div>
      </aside>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main style={{ marginLeft: 220, padding: '24px 32px', paddingTop: 20 }}>
        <header style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>
            {selectedTab === 'overview' && '📊 Platform Overview'}
            {selectedTab === 'orders' && '🛵 Live Orders'}
            {selectedTab === 'branches' && '🏪 Kitchen Monitoring'}
            {selectedTab === 'support' && '🛡️ Support & Security'}
          </h1>
          <p style={{ margin: '4px 0 0', color: '#666', fontSize: 14 }}>
            {selectedTab === 'overview' && 'Real-time KPIs across all branches'}
            {selectedTab === 'orders' && `${liveOrders.length} orders currently active`}
            {selectedTab === 'branches' && `${branches.length} kitchen outlets monitored`}
            {selectedTab === 'support' && `${tickets.length} total tickets · ${openTickets.length} active`}
          </p>
        </header>

        {/* ═══════════════════════════════════════════════════════════════
            OVERVIEW TAB
        ═══════════════════════════════════════════════════════════════ */}
        {selectedTab === 'overview' && (
          <>
            {/* KPI Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16, marginBottom: 24 }}>
              <KPICard label="Revenue Today" value={`₹${stats.revenue.toLocaleString()}`} delta="+12%" upColor="#4caf50" />
              <KPICard label="Total Orders" value={String(stats.orders)} delta="Today" upColor="#2196f3" />
              <KPICard label="Drivers Online" value={String(stats.driversOnline)} delta="92% util" upColor="#4caf50" />
              <KPICard label="Refunds" value={String(stats.refunds)} delta="Processed" upColor="#ff9800" />
              <KPICard label="Open Disputes" value={String(openTickets.length)} delta="Action req" upColor="#ff4444" />
              <KPICard label="Fraud Blocks" value={String(stats.fraudAlerts)} delta="Today" upColor="#9c27b0" />
            </div>

            {/* Revenue + Live feed */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
              <Card title="Revenue — 24h Trend">
                <div style={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f04e31" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#f04e31" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                      <XAxis dataKey="t" tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        formatter={(val: number, name: string) => [name === 'revenue' ? `₹${val.toLocaleString()}` : val, name === 'revenue' ? 'Revenue' : 'Orders']}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#f04e31" strokeWidth={2.5} fill="url(#revGrad)" dot={{ r: 3, fill: '#f04e31' }} />
                      <Line type="monotone" dataKey="orders" stroke="#2196f3" strokeWidth={1.5} dot={false} strokeDasharray="4 4" yAxisId={0} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card title="Live Order Feed">
                <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                  {liveOrders.length === 0 && <p style={{ color: '#aaa', textAlign: 'center', padding: 20 }}>Waiting for orders…</p>}
                  {liveOrders.map((o) => (
                    <div key={o.id + o.timestamp} style={{ padding: '10px 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>#{o.id}</div>
                        <div style={{ fontSize: 12, color: '#888' }}>{o.branch} · ETA {o.eta}m</div>
                      </div>
                      <span style={{ color: '#4caf50', fontWeight: 'bold', fontSize: 14 }}>₹{o.amount}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* System alerts */}
            <Card title="🚨 System Alerts">
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {branches.filter(b => b.status !== 'operational').map(b => (
                  <div key={b.name} style={{ flex: 1, padding: '12px 16px', background: '#fff5f5', borderLeft: `4px solid ${branchStatusColor[b.status]}`, borderRadius: 6, minWidth: 220 }}>
                    <strong>{b.name} Kitchen</strong> — {b.status === 'delayed' ? `Avg prep ${b.avgPrepMins}m (target 18m)` : 'CRITICAL — all drivers exhausted'}
                  </div>
                ))}
                {branches.filter(b => b.status === 'operational').length > 0 && (
                  <div style={{ flex: 1, padding: '12px 16px', background: '#f5fff5', borderLeft: `4px solid #4caf50`, borderRadius: 6, minWidth: 220 }}>
                    All other {branches.filter(b => b.status === 'operational').length} branches are within normal SLA targets.
                  </div>
                )}
              </div>
            </Card>
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            ORDERS TAB
        ═══════════════════════════════════════════════════════════════ */}
        {selectedTab === 'orders' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            <KPICard label="New" value={String(liveOrders.filter(o => o.status === 'received').length)} upColor="#f04e31" />
            <KPICard label="Confirmed" value={String(liveOrders.filter(o => o.status === 'confirmed').length)} upColor="#ff9800" />
            <KPICard label="Preparing" value={String(liveOrders.filter(o => o.status === 'preparing').length)} upColor="#2196f3" />
            <KPICard label="Ready for Pickup" value={String(liveOrders.filter(o => o.status === 'ready').length)} upColor="#4caf50" />
            <KPICard label="Delivered (today)" value={String(stats.orders - liveOrders.length)} upColor="#9c27b0" />
            <KPICard label="Cancelled (today)" value="0" upColor="#999" />

            <div style={{ gridColumn: '1 / -1' }}>
              <Card title="Active Orders — live socket stream" sub={`${liveOrders.length} items`}>
                <div style={{ maxHeight: 500, overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #eee' }}>
                        {['Order #', 'Branch', 'Amount', 'ETA', 'Status', 'Age'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#888', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {liveOrders.map((o) => (
                        <tr key={o.id + o.timestamp} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '10px 12px', fontWeight: 'bold' }}>#{o.id}</td>
                          <td style={{ padding: '10px 12px', color: '#666' }}>{o.branch}</td>
                          <td style={{ padding: '10px 12px', fontWeight: 'bold', color: DESIGN_TOKENS.colors.primary }}>₹{o.amount}</td>
                          <td style={{ padding: '10px 12px', color: '#888' }}>{o.eta}m</td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{
                              padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 'bold',
                              background: o.status === 'delivered' ? '#e8f5e8' :
                                o.status === 'ready' ? '#e8f5e8' :
                                  o.status === 'preparing' ? '#fff3e0' : '#f5f5f5',
                              color: o.status === 'received' ? '#f04e31' : '#555',
                            }}>{o.status.toUpperCase()}</span>
                          </td>
                          <td style={{ padding: '10px 12px', color: '#999', fontSize: 12 }}>
                            {Math.floor((Date.now() - o.timestamp) / 60000)}m
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {liveOrders.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>No orders yet — new ones arrive via socket</div>
                  )}
                </div>
              </Card>
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <Card title="Order Status Breakdown">
                <div style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { status: 'New', count: liveOrders.filter(o => o.status === 'received').length },
                      { status: 'Confirmed', count: liveOrders.filter(o => o.status === 'confirmed').length },
                      { status: 'Preparing', count: liveOrders.filter(o => o.status === 'preparing').length },
                      { status: 'Ready', count: liveOrders.filter(o => o.status === 'ready').length },
                      { status: 'Delivered', count: Math.max(0, stats.orders - liveOrders.length) },
                      { status: 'Cancelled', count: 0 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#f04e31" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card title="Average Order Value" sub="By hour bucket">
                <div style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MOCK_REVENUE}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="t" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'AOV']} />
                      <Area type="monotone" dataKey="orders" stroke="#9c27b0" fill="#e1bee7" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            BRANCHES TAB
        ═══════════════════════════════════════════════════════════════ */}
        {selectedTab === 'branches' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {branches.map((branch) => (
              <Card key={branch.name} title={branch.name} sub={`${branch.orderCount} orders · ${branch.driversAssigned} drivers`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{
                    padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 'bold',
                    background: `${branchStatusColor[branch.status]}22`,
                    color: branchStatusColor[branch.status],
                    border: `1px solid ${branchStatusColor[branch.status]}66`,
                  }}>
                    {branch.status.toUpperCase()}
                  </span>
                  <span style={{ color: '#666', fontSize: 13 }}>
                    Avg prep: <strong style={{ color: branch.avgPrepMins > 20 ? '#ff4444' : '#4caf50' }}>{branch.avgPrepMins}m</strong>
                  </span>
                </div>

                {/* Prep time bar */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888', marginBottom: 4 }}>
                    <span>Prep time</span>
                    <span>{branch.avgPrepMins} / 18 min target</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: '#eee', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${Math.min(100, (branch.avgPrepMins / 18) * 100)}%`,
                      background: branch.avgPrepMins > 20 ? '#ff4444' : '#4caf50', borderRadius: 4, transition: 'width 0.4s',
                    }} />
                  </div>
                </div>

                {/* Drivers vs orders ratio */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888', marginBottom: 4 }}>
                    <span>Driver coverage</span>
                    <span>{branch.driversAssigned} drivers / {branch.orderCount} orders</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: '#eee', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${Math.min(100, (branch.driversAssigned / branch.orderCount) * 100)}%`,
                      background: branch.driversAssigned < branch.orderCount * 0.3 ? '#ff9800' : '#2196f3', borderRadius: 4,
                    }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <Button label="View KDS" onClick={() => alert(`Opening KDS for ${branch.name}`)} style={{ flex: 1 }} />
                  <Button label="Dispatch Driver" onClick={() => alert(`Dispatching driver to ${branch.name}`)} variant="secondary" style={{ flex: 1 }} />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            SUPPORT TAB
        ═══════════════════════════════════════════════════════════════ */}
        {selectedTab === 'support' && (
          <>
            {/* Summary row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
              <KPICard label="Total Tickets" value={String(tickets.length)} upColor="#888" />
              <KPICard label="Refunds (today)" value={String(pendingRefunds.length)} upColor="#ff9800" />
              <KPICard label="Fraud Blocks" value={String(stats.fraudAlerts)} upColor="#9c27b0" />
              <KPICard label="Avg Resolution" value="4m 12s" upColor="#4caf50" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {/* Tickets list */}
              <Card title={`🧾 Support Tickets — ${filteredTickets.length} items`} sub="sorted by urgency">
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  {(['all', 'refund', 'support', 'fraud'] as const).map((f) => (
                    <Button
                      key={f}
                      label={f === 'all' ? 'All' : typeIcon[f] + ' ' + f.charAt(0).toUpperCase() + f.slice(1)}
                      onClick={() => setTicketFilter(f)}
                      variant={ticketFilter === f ? 'primary' : 'secondary'}
                      style={{ padding: '4px 12px', fontSize: 12 }}
                    />
                  ))}
                </div>
                <div style={{ maxHeight: 480, overflowY: 'auto' }}>
                  {filteredTickets.map((t) => (
                    <div key={t.id} style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ fontSize: 16 }}>{typeIcon[t.type]}</span>
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{t.id}</span>
                          <span style={{ padding: '2px 8px', borderRadius: 8, fontSize: 11, fontWeight: 'bold', background: `${sevColor[t.severity]}22`, color: sevColor[t.severity] }}>
                            {t.severity.toUpperCase()}
                          </span>
                        </div>
                        <span style={{ fontSize: 11, color: '#aaa' }}>{t.createdAt}</span>
                      </div>
                      <p style={{ margin: '2px 0 4px', color: '#555', fontSize: 13 }}>{t.description}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: '#888' }}>Reported by: {t.user} {t.amount ? `· ₹${t.amount}` : ''}</span>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <Button label={t.type === 'refund' ? 'Refund' : 'Reply'} onClick={() => {}} style={{ padding: '4px 10px', fontSize: 12 }} />
                          <Button label="Close" onClick={() => setTickets(prev => prev.filter(x => x.id !== t.id))} variant="secondary" style={{ padding: '4px 10px', fontSize: 12 }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Refund management */}
                <Card title="💸 Refund Management" sub="Recent requests">
                  {pendingRefunds.map((t) => (
                    <div key={t.id} style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{t.id}</span>
                        <span style={{ fontWeight: 'bold', color: '#ff4444' }}>-₹{t.amount}</span>
                      </div>
                      <p style={{ color: '#666', fontSize: 12, margin: '0 0 8px' }}>{t.description}</p>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Button label="Approve" onClick={() => { setStats(s => ({ ...s, refunds: s.refunds + 1 })); setTickets(prev => prev.filter(x => x.id !== t.id)); }} style={{ flex: 1, padding: '6px 0', fontSize: 12 }} />
                        <Button label="Reject" onClick={() => setTickets(prev => prev.filter(x => x.id !== t.id))} variant="secondary" style={{ flex: 1, padding: '6px 0', fontSize: 12 }} />
                      </div>
                    </div>
                  ))}
                  {pendingRefunds.length === 0 && <p style={{ color: '#aaa', textAlign: 'center', padding: 20 }}>No pending refunds</p>}
                </Card>

                {/* Fraud detection */}
                <Card title="🛡️ Fraud Detection" sub="Recent blocks">
                  {tickets.filter(t => t.type === 'fraud').map(t => (
                    <div key={t.id} style={{ padding: '12px', background: '#fff5f5', borderRadius: 8, marginBottom: 8, borderLeft: `4px solid #f04e31` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <strong style={{ color: '#f04e31' }}>🚫 {t.id}</strong>
                        <span style={{ color: '#999', fontSize: 12 }}>{t.createdAt}</span>
                      </div>
                      <p style={{ margin: '0 0 8px', fontSize: 13 }}>{t.description}</p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Button label="Investigate" onClick={() => alert(`Opening case ${t.id}`)} style={{ flex: 1, padding: '6px 0', fontSize: 12 }} />
                        <Button label="Block IP" onClick={() => alert(`IP blocked for ${t.id}`)} variant="secondary" style={{ flex: 1, padding: '6px 0', fontSize: 12 }} />
                      </div>
                    </div>
                  ))}
                </Card>
              </div>
            </div>
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            DELIVERY HEATMAP — visible on overview bottom
        ═══════════════════════════════════════════════════════════════ */}
        {selectedTab === 'overview' && (
          <div style={{ marginTop: 24 }}>
            <Card title="📍 Delivery Heatmap" sub={`SpiceGarden service area — ${heatmapData.length > 0 ? `${heatmapData.length} data points` : 'computing…'}`}>
              {heatmapData.length > 0 ? (
                <div>
                  <DeliveryHeatmap data={heatmapData} />
                  <div style={{ display: 'flex', gap: 20, marginTop: 16, fontSize: 13, color: '#666' }}>
                    {Array.from(new Set(heatmapData.map(p => p.label))).map(label => {
                      const pts = heatmapData.filter(p => p.label === label);
                      const avg = pts.reduce((s, p) => s + p.intensity, 0) / pts.length;
                      return (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 14, height: 14, borderRadius: 3, background: `rgba(220,70,30,${avg})` }} />
                          {label} <strong style={{ color: '#f04e31' }}>{Math.round(avg * 100)}%</strong>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>Initializing heatmap…</div>
              )}
            </Card>
          </div>
        )}
      </main>

      {/* Global CSS */}
      <style>{`
        * { box-sizing: border-box; }
        button { font-family: inherit; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3; }
      `}</style>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function KPICard({ label, value, upColor, delta }: { label: string; value: string; upColor?: string; delta?: string }) {
  return (
    <div style={{
      background: 'white', borderRadius: 12, padding: 18, border: '1px solid #e0e0e0',
      boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
    }}>
      <div style={{ fontSize: 12, color: '#888', fontWeight: 500, textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: '#1a1a2e' }}>{value}</div>
      {delta && <div style={{ fontSize: 12, color: upColor || '#888', marginTop: 4, fontWeight: 500 }}>↑ {delta}</div>}
    </div>
  );
}

function Card({ title, sub, children, style }: { title: string; sub?: string; children: React.ReactNode; style?: any }) {
  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 20, border: '1px solid #e0e0e0', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', ...style }}>
      {title && <h3 style={{ margin: '0 0 4px 0', fontSize: 17, fontWeight: 700 }}>{title}</h3>}
      {sub && <p style={{ margin: '0 0 16px 0', fontSize: 13, color: '#888' }}>{sub}</p>}
      {children}
    </div>
  );
}

function Button({ label, onClick, style, variant = 'primary', ...rest }: any) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 16px',
        borderRadius: 8,
        border: 'none',
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: 600,
        color: 'white',
        background: variant === 'primary' ? '#f04e31' : variant === 'secondary' ? '#f0f0f0' : variant === 'danger' ? '#ff4444' : '#2196f3',
        ...style,
      }}
      {...rest}
    >
      {label}
    </button>
  );
}
