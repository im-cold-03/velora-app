'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

const navItems = ['Overview', 'Orders', 'Inventory', 'AI Reorder', 'Security', 'Admin']

const inventoryHealth = [
  { name: 'Cold Brew', count: 18, status: 'Reorder soon', tone: 'text-[#d97706]' },
  { name: 'Oat Milk', count: 6, status: 'Low', tone: 'text-[#dc2626]' },
  { name: 'Tea Boxes', count: 42, status: 'Healthy', tone: 'text-[#13834b]' },
  { name: 'Granola', count: 12, status: 'Low', tone: 'text-[#dc2626]' },
]

const initialInventoryItems = [
  { name: 'Iced Latte', sku: 'LAT-001', stock: 42, price: '$5.50', status: 'Healthy', tone: 'text-[#13834b]', enabled: true },
  { name: 'Oat Milk', sku: 'MLK-014', stock: 6, price: '$2.80', status: 'Low', tone: 'text-[#dc2626]', enabled: true },
  { name: 'Tea Boxes', sku: 'TEA-022', stock: 42, price: '$8.00', status: 'Healthy', tone: 'text-[#13834b]', enabled: false },
  { name: 'Granola', sku: 'GRA-008', stock: 12, price: '$4.00', status: 'Low', tone: 'text-[#dc2626]', enabled: true },
  { name: 'Cold Brew', sku: 'CBR-006', stock: 18, price: '$5.00', status: 'Reorder soon', tone: 'text-[#d97706]', enabled: true },
  { name: 'Canvas Tote', sku: 'TTE-011', stock: 31, price: '$18.00', status: 'Healthy', tone: 'text-[#13834b]', enabled: false },
]

const aiSuggestions = [
  { id: 'AI-101', item: 'Oat Milk', currentStock: 6, burnRate: '14 units/day', suggestedQty: 48, supplier: 'Pacific Foods Co.', estCost: '$134.40', urgency: 'High' },
  { id: 'AI-102', item: 'Cold Brew', currentStock: 18, burnRate: '22 units/day', suggestedQty: 60, supplier: 'Velora Roasters', estCost: '$300.00', urgency: 'Medium' },
  { id: 'AI-103', item: 'Granola', currentStock: 12, burnRate: '8 units/day', suggestedQty: 30, supplier: 'Artisan Bakery', estCost: '$120.00', urgency: 'Medium' },
]

interface StaffMember {
  id: string
  name: string
  role: 'Owner / Admin' | 'Store Manager' | 'Cashier'
  pin: string
  level: number
  lastActive: string
}

interface SupabaseOrderRow {
  id: number
  total: number
  payment_method: string
  staff_name: string
  items: Record<string, number>
  status?: string
  created_at?: string
}

const initialStaff: StaffMember[] = [
  { id: 'STF-01', name: 'Maya Lin', role: 'Owner / Admin', pin: '1234', level: 3, lastActive: 'Now' },
  { id: 'STF-02', name: 'Alex Rivera', role: 'Store Manager', pin: '5678', level: 2, lastActive: '12m ago' },
  { id: 'STF-03', name: 'Jordan Kai', role: 'Cashier', pin: '0000', level: 1, lastActive: '1h ago' },
]

const cameraFeeds = [
  { id: 'CAM-01', name: 'Register 01 Front', status: 'Live', resolution: '1080p 30fps', location: 'Checkout Counter' },
  { id: 'CAM-02', name: 'Register 02 Rear', status: 'Live', resolution: '1080p 30fps', location: 'Checkout Counter' },
  { id: 'CAM-03', name: 'Stockroom Entrance', status: 'Live', resolution: '1080p 24fps', location: 'Back Room' },
  { id: 'CAM-04', name: 'Customer Display Area', status: 'Live', resolution: '1080p 30fps', location: 'Main Store' },
]

const chartPath = 'M0 172 C48 166 79 151 124 155 C163 159 183 134 222 127 C257 120 265 144 302 117 C341 89 359 111 390 91 C424 70 453 40 500 20'

function Logo() {
  return (
    <div className="grid size-[30px] place-items-center overflow-hidden rounded-[9px] bg-[#101010]">
      <img src="/velora-white.png" alt="Velora" className="size-[19px] object-contain" />
    </div>
  )
}

function formatOrderItems(itemsObj: Record<string, number> | null): string {
  if (!itemsObj || typeof itemsObj !== 'object') return 'No items'
  return Object.entries(itemsObj)
    .map(([item, qty]) => `${qty}x ${item}`)
    .join(', ')
}

/* ---------------- TAB 1: OVERVIEW ---------------- */
function OverviewScreen({ today, storeName }: { today: string; storeName: string }) {
  return (
    <>
      <div>
        <p className="text-[11px] font-medium text-[#5f5f5b]">{today}</p>
        <h1 className="mt-3 text-[32px] font-bold leading-none tracking-[-0.055em] sm:text-[34px]">good morning, maya</h1>
        <p className="mt-2 text-[14px] text-[#777772]">Here’s how {storeName} is doing today.</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Total sales today', '$12,482', '+8.4% vs yesterday'],
          ['Active cashiers', '18', '2 on break'],
          ['Top selling item', 'Iced Latte', '124 sold today'],
          ['Low stock alerts', '7', '3 urgent'],
        ].map(([label, value, detail]) => (
          <article key={label} className="rounded-[15px] bg-white px-[18px] py-[18px] border border-[#ecece8]">
            <p className="text-[11px] text-[#686863]">{label}</p>
            <p className="mt-3 truncate text-[28px] font-bold leading-none tracking-[-0.05em]">{value}</p>
            <p className="mt-2 text-[11px] text-[#13834b]">{detail}</p>
          </article>
        ))}
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.7fr)]">
        <article className="rounded-[16px] bg-white px-6 py-6 sm:px-7 border border-[#ecece8]">
          <h2 className="text-[18px] font-semibold tracking-[-0.035em]">sales velocity</h2>
          <p className="mt-2 text-[11px] text-[#777772]">today</p>
          <div className="mt-8 h-[310px] w-full sm:mt-10">
            <svg className="h-full w-full" viewBox="0 0 520 220" preserveAspectRatio="none" role="img" aria-label="Sales velocity chart">
              <path d="M0 172 H500" fill="none" stroke="#d2d2cd" strokeWidth="1" />
              <path d={chartPath} fill="none" stroke="#171717" strokeWidth="3" vectorEffect="non-scaling-stroke" />
              <circle cx="500" cy="20" r="5" fill="#171717" />
              <g fill="#858580" fontSize="9" fontFamily="sans-serif">
                <text x="0" y="194">8 AM</text>
                <text x="96" y="194">10 AM</text>
                <text x="202" y="194">12 PM</text>
                <text x="312" y="194">2 PM</text>
                <text x="418" y="194">4 PM</text>
                <text x="478" y="194">6 PM</text>
              </g>
              <g fill="#858580" fontSize="9" textAnchor="end" fontFamily="sans-serif">
                <text x="516" y="174">$0</text>
                <text x="516" y="118">$4k</text>
                <text x="516" y="62">$8k</text>
                <text x="516" y="20">$12k</text>
              </g>
            </svg>
          </div>
        </article>

        <article className="rounded-[16px] bg-white px-5 py-6 sm:px-6 border border-[#ecece8]">
          <h2 className="text-[18px] font-semibold tracking-[-0.035em]">inventory health</h2>
          <div className="mt-6 flex flex-col gap-4">
            {inventoryHealth.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-[11px] bg-[#f5f5f3] px-3.5 py-3">
                <div>
                  <p className="text-[13px] font-medium">{item.name}</p>
                  <p className="mt-1 text-[11px] text-[#777772]">{item.count} in stock</p>
                </div>
                <p className={`text-[11px] font-medium ${item.tone}`}>{item.status}</p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </>
  )
}

/* ---------------- TAB 2: ORDERS ---------------- */
function OrdersScreen() {
  const [orders, setOrders] = useState<SupabaseOrderRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true)
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('id', { ascending: false })

      if (error) {
        console.error('Error fetching Supabase orders:', error)
      } else if (data) {
        setOrders(data as SupabaseOrderRow[])
      }
      setLoading(false)
    }

    fetchOrders()

    const channel = supabase
      .channel('realtime_orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          setOrders((prev) => [payload.new as SupabaseOrderRow, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-[32px] font-bold leading-none tracking-[-0.055em]">orders history</h1>
          <p className="mt-2 text-[14px] text-[#777772]">Live Supabase database connection and register audit trail.</p>
        </div>
        <button type="button" className="rounded-[10px] bg-[#101010] px-6 py-3 text-[13px] font-medium text-white transition-colors hover:bg-[#292929]">Export CSV</button>
      </div>

      <div className="mt-9 overflow-x-auto rounded-[16px] bg-white px-6 py-3 border border-[#ecece8]">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-[0.8fr_2.5fr_1fr_1.2fr_1fr_1fr] border-b border-[#deded9] py-3 text-[11px] text-[#686863]">
            <span>Order ID</span><span>Items Purchased</span><span>Total</span><span>Payment</span><span>Cashier</span><span>Status</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-[13px] text-[#777772]">Fetching orders from Supabase...</div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-[13px] text-[#777772]">No orders recorded yet.</div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="grid grid-cols-[0.8fr_2.5fr_1fr_1.2fr_1fr_1fr] items-center border-b border-[#deded9] py-5 text-[13px] last:border-b-0">
                <span className="font-semibold">ORD-#{order.id}</span>
                <span className="truncate pr-4 font-medium text-[#101010]">{formatOrderItems(order.items)}</span>
                <span className="font-semibold text-[#101010]">${Number(order.total).toFixed(2)}</span>
                <span className="capitalize text-[#686863]">{order.payment_method || 'Card'}</span>
                <span className="text-[#686863]">{order.staff_name || 'Staff'}</span>
                <span>
                  <span className="inline-block rounded-full bg-[#e6f4ea] px-2.5 py-1 text-[11px] font-medium text-[#13834b]">
                    {order.status || 'Completed'}
                  </span>
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

/* ---------------- TAB 3: INVENTORY ---------------- */
function InventoryScreen() {
  const [items, setItems] = useState(initialInventoryItems)

  const toggleAutoReorder = (sku: string) => {
    setItems((prev) =>
      prev.map((item) => (item.sku === sku ? { ...item, enabled: !item.enabled } : item))
    )
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-[32px] font-bold leading-none tracking-[-0.055em]">inventory</h1>
          <p className="mt-2 text-[14px] text-[#777772]">Manage stock, pricing, and AI reorder rules.</p>
        </div>
        <button type="button" className="rounded-[10px] bg-[#101010] px-6 py-3 text-[13px] font-medium text-white transition-colors hover:bg-[#292929]">+ Add item</button>
      </div>

      <div className="mt-9 overflow-x-auto rounded-[16px] bg-white px-6 py-3 border border-[#ecece8]">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[2.1fr_1.1fr_0.8fr_0.8fr_1.2fr_1fr] border-b border-[#deded9] py-3 text-[11px] text-[#686863]">
            <span>Item name</span><span>SKU</span><span>In stock</span><span>Price</span><span>Reorder status</span><span>Auto-reorder with AI</span>
          </div>
          {items.map((item) => (
            <div key={item.sku} className="grid grid-cols-[2.1fr_1.1fr_0.8fr_0.8fr_1.2fr_1fr] items-center border-b border-[#deded9] py-6 text-[13px] last:border-b-0">
              <span className="font-medium">{item.name}</span>
              <span className="text-[#777772]">{item.sku}</span>
              <span>{item.stock}</span>
              <span>{item.price}</span>
              <span className={item.tone}>{item.status}</span>
              <div>
                <button
                  type="button"
                  onClick={() => toggleAutoReorder(item.sku)}
                  className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                    item.enabled ? 'bg-[#101010]' : 'bg-[#e0e0dc]'
                  }`}
                >
                  <span
                    className={`size-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
                      item.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-12 flex justify-end">
        <button type="button" className="rounded-[10px] bg-[#101010] px-6 py-3 text-[13px] font-medium text-white transition-colors hover:bg-[#292929]">Auto-reorder all</button>
      </div>
    </div>
  )
}

/* ---------------- TAB 4: AI REORDER ---------------- */
function AIReorderScreen() {
  return (
    <div>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-[32px] font-bold leading-none tracking-[-0.055em]">AI stock forecast</h1>
          <p className="mt-2 text-[14px] text-[#777772]">Autonomous depletion predictions and vendor order generation.</p>
        </div>
        <button type="button" className="rounded-[10px] bg-[#101010] px-6 py-3 text-[13px] font-medium text-white transition-colors hover:bg-[#292929]">Approve All Purchase Orders</button>
      </div>

      <div className="mt-6 rounded-[16px] bg-[#101010] p-6 text-white border border-[#222]">
        <div className="flex items-center gap-3">
          <div className="size-2 rounded-full bg-[#13834b] animate-pulse" />
          <p className="text-[13px] font-semibold uppercase tracking-wider text-[#999]">Velora Neural Engine Active</p>
        </div>
        <p className="mt-3 text-[18px] font-medium leading-snug">
          "Based on Monday sales trends, <span className="text-[#f59e0b]">Oat Milk</span> will run out in 10 hours. Reorder batch queued."
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-4">
        {aiSuggestions.map((rec) => (
          <div key={rec.id} className="flex flex-col gap-4 rounded-[16px] bg-white p-6 border border-[#ecece8] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-[18px] font-bold">{rec.item}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                  rec.urgency === 'High' ? 'bg-[#fce8e6] text-[#dc2626]' : 'bg-[#fef3c7] text-[#d97706]'
                }`}>
                  {rec.urgency} Urgency
                </span>
              </div>
              <p className="mt-2 text-[13px] text-[#777772]">
                Current Stock: <strong className="text-[#101010]">{rec.currentStock}</strong> | Burn Rate: {rec.burnRate}
              </p>
              <p className="mt-1 text-[12px] text-[#888882]">
                Supplier: {rec.supplier} | Est. Cost: {rec.estCost}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" className="rounded-[10px] border border-[#deded9] px-5 py-2.5 text-[13px] font-medium text-[#101010] hover:bg-[#f5f5f3]">
                Adjust Qty ({rec.suggestedQty})
              </button>
              <button type="button" className="rounded-[10px] bg-[#101010] px-5 py-2.5 text-[13px] font-medium text-white hover:bg-[#292929]">
                Send PO Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------------- TAB 5: SECURITY ---------------- */
function SecurityScreen() {
  return (
    <div>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-[32px] font-bold leading-none tracking-[-0.055em]">security surveillance</h1>
          <p className="mt-2 text-[14px] text-[#777772]">Real-time CCTV register feeds and terminal motion monitoring.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-[#13834b] animate-pulse" />
          <span className="text-[13px] font-medium text-[#13834b]">4 Feeds Online</span>
        </div>
      </div>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        {cameraFeeds.map((cam) => (
          <div key={cam.id} className="overflow-hidden rounded-[16px] bg-[#101010] border border-[#222] shadow-sm">
            <div className="relative flex h-[220px] w-full items-center justify-center bg-zinc-900 p-4">
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-md bg-black/60 px-2.5 py-1 text-[11px] text-white backdrop-blur-sm">
                <span className="size-2 rounded-full bg-red-500 animate-pulse" />
                <span className="font-mono">{cam.id} • {cam.status}</span>
              </div>
              <div className="absolute right-4 top-4 rounded-md bg-black/60 px-2 py-1 text-[10px] text-zinc-400 font-mono">
                {cam.resolution}
              </div>
              <p className="text-[13px] text-zinc-500 font-mono">[ Simulated Feed: {cam.name} ]</p>
              <div className="absolute bottom-3 left-4 text-[11px] text-zinc-400">
                Location: <span className="text-white">{cam.location}</span>
              </div>
            </div>
            <div className="flex items-center justify-between bg-[#181818] px-4 py-3 text-white">
              <span className="text-[13px] font-medium">{cam.name}</span>
              <button type="button" className="rounded-[6px] bg-white/10 px-3 py-1 text-[11px] hover:bg-white/20">Fullscreen</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------------- TAB 6: ADMIN (CONNECTED TO SUPABASE) ---------------- */
function AdminScreen({
  currentStoreName,
  currentLocationId,
  currentAccentColor,
  onSaveSettings,
  staffList,
}: {
  currentStoreName: string
  currentLocationId: string
  currentAccentColor: string
  onSaveSettings: (newStoreName: string, newLocationId: string, newAccentColor: string) => Promise<boolean>
  staffList: StaffMember[]
}) {
  const [tempStoreName, setTempStoreName] = useState(currentStoreName)
  const [tempLocationId, setTempLocationId] = useState(currentLocationId)
  const [tempAccentColor, setTempAccentColor] = useState(currentAccentColor)
  const [isSaving, setIsSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  useEffect(() => {
    setTempStoreName(currentStoreName)
    setTempLocationId(currentLocationId)
    setTempAccentColor(currentAccentColor)
  }, [currentStoreName, currentLocationId, currentAccentColor])

  const handleSave = async () => {
    setIsSaving(true)
    const success = await onSaveSettings(tempStoreName, tempLocationId, tempAccentColor)
    setIsSaving(false)

    if (success) {
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 3000)
    }
  }

  return (
    <div>
      <div>
        <h1 className="text-[32px] font-bold leading-none tracking-[-0.055em]">admin settings</h1>
        <p className="mt-2 text-[14px] text-[#777772]">Store profile, custom branding, theme color, and staff permissions.</p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[16px] bg-white p-6 border border-[#ecece8]">
          <h2 className="text-[18px] font-semibold tracking-[-0.035em]">Store Profile</h2>
          <p className="mt-1 text-[12px] text-[#777772]">This updates the name across POS displays, customer screens, and receipts.</p>

          <div className="mt-6 flex flex-col gap-5">
            <div>
              <label className="block text-[12px] font-medium text-[#555]">Business / Store Name</label>
              <input
                type="text"
                value={tempStoreName}
                onChange={(e) => setTempStoreName(e.target.value)}
                className="mt-2 w-full rounded-[10px] border border-[#deded9] px-4 py-2.5 text-[14px] outline-none focus:border-[#101010]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#555]">Store Location ID</label>
              <input
                type="text"
                value={tempLocationId}
                onChange={(e) => setTempLocationId(e.target.value)}
                className="mt-2 w-full rounded-[10px] border border-[#deded9] px-4 py-2.5 text-[14px] outline-none focus:border-[#101010]"
              />
            </div>
          </div>
        </div>

        <div className="rounded-[16px] bg-white p-6 border border-[#ecece8]">
          <h2 className="text-[18px] font-semibold tracking-[-0.035em]">Theme & Branding</h2>
          <p className="mt-1 text-[12px] text-[#777772]">Select an accent color for registers and displays.</p>

          <div className="mt-6 flex flex-col gap-5">
            <div>
              <label className="block text-[12px] font-medium text-[#555]">Accent Color Hex</label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="color"
                  value={tempAccentColor.startsWith('#') ? tempAccentColor : `#${tempAccentColor}`}
                  onChange={(e) => setTempAccentColor(e.target.value)}
                  className="size-10 cursor-pointer rounded-lg border-0 bg-transparent"
                />
                <input
                  type="text"
                  value={tempAccentColor}
                  onChange={(e) => setTempAccentColor(e.target.value)}
                  className="w-full rounded-[10px] border border-[#deded9] px-4 py-2.5 text-[14px] font-mono outline-none focus:border-[#101010]"
                />
              </div>
            </div>

            <div className="rounded-[12px] p-4 text-white transition-colors" style={{ backgroundColor: tempAccentColor.startsWith('#') ? tempAccentColor : `#${tempAccentColor}` }}>
              <p className="text-[11px] uppercase tracking-wider opacity-80">Staged Theme Preview</p>
              <p className="mt-2 text-[16px] font-semibold">{tempStoreName || 'Velora Store'}</p>
              <p className="text-[12px] opacity-90">Click Save Store Settings below to sync to Supabase</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between rounded-[16px] bg-white p-6 border border-[#ecece8]">
        {savedSuccess ? (
          <p className="text-[13px] font-medium text-[#13834b]">✓ Saved and updated in Supabase database!</p>
        ) : (
          <p className="text-[12px] text-[#777772]">Updates to store settings write directly to your database.</p>
        )}
        <button
          type="button"
          disabled={isSaving}
          onClick={handleSave}
          className="rounded-[10px] bg-[#101010] px-7 py-3 text-[13px] font-medium text-white transition-colors hover:bg-[#292929] disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Store Settings'}
        </button>
      </div>

      <div className="mt-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div>
            <h2 className="text-[22px] font-bold tracking-[-0.035em]">Staff PIN Management</h2>
            <p className="mt-1 text-[13px] text-[#777772]">Control PIN access codes and permission tiers for cashiers and managers.</p>
          </div>
          <button type="button" className="rounded-[10px] bg-[#101010] px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#292929]">+ Add Staff Member</button>
        </div>

        <div className="mt-5 overflow-x-auto rounded-[16px] bg-white px-6 py-3 border border-[#ecece8]">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-[1fr_1.5fr_1.2fr_1.2fr_1fr] border-b border-[#deded9] py-3 text-[11px] text-[#686863]">
              <span>Staff ID</span><span>Name</span><span>Role</span><span>PIN Code</span><span>Last Active</span>
            </div>
            {staffList.map((member) => (
              <div key={member.id} className="grid grid-cols-[1fr_1.5fr_1.2fr_1.2fr_1fr] items-center border-b border-[#deded9] py-5 text-[13px] last:border-b-0">
                <span className="text-[#777772]">{member.id}</span>
                <span className="font-semibold">{member.name}</span>
                <span>
                  <span className="rounded-full bg-[#f5f5f3] px-3 py-1 text-[11px] font-medium text-[#101010]">
                    {member.role}
                  </span>
                </span>
                <span className="text-[#13834b] font-mono text-[13px]">•••• ({member.pin})</span>
                <span className="text-[#777772]">{member.lastActive}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------- MAIN DASHBOARD CONTAINER & SECURE LOGIN ---------------- */
export default function Page() {
  const today = useMemo(() => 'MONDAY, 5 OCTOBER', [])
  const [activeNav, setActiveNav] = useState('Overview')

  const [storeName, setStoreName] = useState('YKK Live Store')
  const [locationId, setLocationId] = useState('Store 04 - Henderson')
  const [accentColor, setAccentColor] = useState('#101010')

  const [staffList] = useState<StaffMember[]>(initialStaff)
  const [activeUser, setActiveUser] = useState<StaffMember | null>(null)
  const [pinInput, setPinInput] = useState('')
  const [loginError, setLoginError] = useState('')

  // Fetch settings from Supabase on mount
  useEffect(() => {
    async function loadStoreSettings() {
      const { data } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle()

      if (data) {
        if (data.store_name) setStoreName(data.store_name)
        if (data.location_id) setLocationId(data.location_id)
        if (data.accent_color_hex) {
          const hex = String(data.accent_color_hex)
          setAccentColor(hex.startsWith('#') ? hex : `#${hex}`)
        }
      }
    }

    loadStoreSettings()
  }, [])

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const foundUser = staffList.find((s) => s.pin === pinInput)

    if (foundUser) {
      setActiveUser(foundUser)
      setPinInput('')
      setLoginError('')
    } else {
      setLoginError('Invalid PIN code. Try 1234 for Owner or 0000 for Cashier.')
      setPinInput('')
    }
  }

  // Upsert updated store settings directly to Supabase row ID = 1
  const handleSaveStoreSettings = async (
    newStoreName: string,
    newLocationId: string,
    newAccentColor: string
  ): Promise<boolean> => {
    const cleanHex = newAccentColor.replace('#', '')

    const { error } = await supabase.from('settings').upsert({
      id: 1,
      store_name: newStoreName,
      location_id: newLocationId,
      accent_color_hex: cleanHex,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error('Failed to update Supabase settings:', error.message)
      alert(`Error saving to database: ${error.message}`)
      return false
    }

    setStoreName(newStoreName)
    setLocationId(newLocationId)
    setAccentColor(newAccentColor.startsWith('#') ? newAccentColor : `#${newAccentColor}`)
    return true
  }

  if (!activeUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f5f3] p-4 text-[#101010]">
        <div className="w-full max-w-md rounded-[24px] bg-white p-8 shadow-sm border border-[#ecece8]">
          <div className="flex flex-col items-center text-center">
            <Logo />
            <h1 className="mt-4 text-[26px] font-bold tracking-[-0.04em]">Velora Merchant Central</h1>
            <p className="mt-1 text-[13px] text-[#777772]">Enter your 4-digit staff PIN code to unlock the terminal.</p>
          </div>

          <form onSubmit={handlePinSubmit} className="mt-8 flex flex-col items-center">
            <input
              type="password"
              maxLength={4}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="••••"
              className="w-48 tracking-[0.5em] text-center text-[28px] font-bold rounded-[14px] border border-[#deded9] py-3 outline-none focus:border-[#101010]"
              autoFocus
            />

            {loginError && <p className="mt-3 text-[12px] text-[#dc2626]">{loginError}</p>}

            <button
              type="submit"
              className="mt-6 w-full rounded-[12px] bg-[#101010] py-3.5 text-[14px] font-medium text-white transition-colors hover:bg-[#292929]"
            >
              Unlock Terminal
            </button>

            <div className="mt-6 rounded-[12px] bg-[#f5f5f3] p-3 text-center text-[11px] text-[#777772] w-full">
              Demo PINs: <strong className="text-[#101010]">1234</strong> (Owner), <strong className="text-[#101010]">5678</strong> (Manager), <strong className="text-[#101010]">0000</strong> (Cashier)
            </div>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f5f5f3] p-4 text-[#101010] sm:p-7">
      <div className="mx-auto min-h-[calc(100vh-2rem)] max-w-[1384px] sm:min-h-[calc(100vh-3.5rem)]">
        <header className="flex items-center justify-between border-b border-[#deded9] pb-5">
          <div className="flex items-center gap-3">
            <Logo />
            <div className="leading-none">
              <p className="text-[15px] font-semibold tracking-[-0.02em]">
                velora <span className="font-normal text-[#6d6d69]">merchant central</span>
              </p>
              <p className="mt-0.5 text-[11px] text-[#777772]">{storeName.toLowerCase()}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[13px] font-semibold">{activeUser.name}</p>
              <p className="text-[11px] text-[#777772]">{activeUser.role}</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveUser(null)}
              className="rounded-[9px] border border-[#deded9] px-3.5 py-2 text-[12px] font-medium text-[#101010] hover:bg-white"
            >
              Lock Terminal
            </button>
          </div>
        </header>

        <div className="mt-5 grid gap-7 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="flex min-h-[640px] flex-col rounded-[16px] bg-[#101010] px-[18px] py-6 text-white">
            <p className="px-1.5 text-[11px] text-[#777772]">VELORA OS</p>
            <nav className="mt-9 flex flex-col gap-2" aria-label="Main navigation">
              {navItems.map((item) => {
                if (item === 'Admin' && activeUser.level < 3) return null

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setActiveNav(item)}
                    className={`rounded-[9px] px-3.5 py-3 text-left text-[13px] transition-colors ${
                      activeNav === item
                        ? 'bg-[#f5f5f3] font-medium text-[#101010]'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    {item}
                  </button>
                )
              })}
            </nav>
            <div className="mt-auto px-1.5">
              <p className="text-[11px] text-[#777772]">ACTIVE STORE</p>
              <p className="mt-2 text-[13px] font-medium">{storeName}</p>
            </div>
          </aside>

          <section className="min-w-0">
            {activeNav === 'Overview' && <OverviewScreen today={today} storeName={storeName} />}
            {activeNav === 'Orders' && <OrdersScreen />}
            {activeNav === 'Inventory' && <InventoryScreen />}
            {activeNav === 'AI Reorder' && <AIReorderScreen />}
            {activeNav === 'Security' && <SecurityScreen />}
            {activeNav === 'Admin' && activeUser.level >= 3 && (
              <AdminScreen
                currentStoreName={storeName}
                currentLocationId={locationId}
                currentAccentColor={accentColor}
                onSaveSettings={handleSaveStoreSettings}
                staffList={staffList}
              />
            )}
          </section>
        </div>
      </div>
    </main>
  )
}