'use client'

<<<<<<< HEAD
import { useMemo, useState } from 'react'
import { Minus, Plus, Search } from 'lucide-react'

const products = [
  { name: 'Iced Latte', price: 5.5, category: 'Drinks', tone: 'bg-[#eeedea]' },
  { name: 'Sparkling Water', price: 3, category: 'Drinks', tone: 'bg-[#e3edff]' },
  { name: 'Berry Soda', price: 4.25, category: 'Drinks', tone: 'bg-[#fbe4e2]' },
  { name: 'Cold Brew', price: 5, category: 'Drinks', tone: 'bg-[#eeedea]' },
  { name: 'Oat Latte', price: 6, category: 'Drinks', tone: 'bg-[#e2f2e8]' },
  { name: 'Chocolate Bar', price: 3.5, category: 'Snacks', tone: 'bg-[#fff1d6]' },
  { name: 'Granola', price: 4, category: 'Snacks', tone: 'bg-[#fff1d6]' },
  { name: 'Canvas Tote', price: 18, category: 'Merch', tone: 'bg-[#e3edff]' },
  { name: 'Velora Mug', price: 16, category: 'Merch', tone: 'bg-[#eeedea]' },
]

const categories = ['Drinks', 'Snacks', 'Merch']
const initialCart = { 'Iced Latte': 1, Granola: 2, 'Velora Mug': 1 } as Record<string, number>
=======
import { useState, useEffect, useRef } from 'react'
import { Minus, Plus, Search, Lock, LogOut, X, CreditCard, Banknote, QrCode, CheckCircle2, Printer, Mail, ArrowRight, Delete } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const colorTones = ['bg-[#eeedea]', 'bg-[#e3edff]', 'bg-[#fbe4e2]', 'bg-[#e2f2e8]', 'bg-[#fff1d6]']

interface Product {
  id?: string
  name: string
  price: number
  category: string
  barcode?: string
  tone?: string
}

interface StaffMember {
  name: string
  role: string
  pin: string
}

interface CompletedOrder {
  orderId: string
  items: Array<{ name: string; qty: number; price: number }>
  subtotal: number
  tax: number
  total: number
  paymentMethod: string
  cashTendered?: number
  changeDue?: number
  staffName: string
  timestamp: string
}
>>>>>>> e5e19a5 (Save state before migrating to AI Studio)

function money(value: number) {
  return `$${value.toFixed(2)}`
}

export default function Page() {
<<<<<<< HEAD
  const [activeCategory, setActiveCategory] = useState('Drinks')
  const [cart, setCart] = useState(initialCart)

  const visibleProducts = products.filter((product) => product.category === activeCategory)
=======
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('Drinks')
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState<Record<string, number>>({})

  // Dynamic Store Name from Supabase Settings
  const [storeName, setStoreName] = useState('YKK Live Store')

  // Staff & Auth
  const [activeStaff, setActiveStaff] = useState<StaffMember | null>(null)
  const [enteredPin, setEnteredPin] = useState('')
  const [pinError, setPinError] = useState('')

  // Payment Drawer & Receipt Screen States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'qr'>('card')
  const [cashTendered, setCashTendered] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [completedOrder, setCompletedOrder] = useState<CompletedOrder | null>(null)

  // Single persistent ref for Supabase Realtime channel
  const channelRef = useRef<any>(null)

  // Fetch store name & subscribe to real-time changes from settings table
  useEffect(() => {
    async function loadStoreSettings() {
      const { data } = await supabase
        .from('settings')
        .select('store_name')
        .eq('id', 1)
        .maybeSingle()

      if (data?.store_name) {
        setStoreName(data.store_name)
      }
    }

    loadStoreSettings()

    const settingsSub = supabase
      .channel('settings-changes-cashier')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'settings', filter: 'id=eq.1' },
        (payload) => {
          if (payload.new?.store_name) {
            setStoreName(payload.new.store_name)
          }
        }
      )
      .subscribe()

    async function loadProducts() {
      setLoading(true)
      const { data, error } = await supabase.from('products').select('*')
      if (!error && data) {
        const styledProducts = data.map((item, index) => ({
          ...item,
          price: Number(item.price),
          tone: item.tone || colorTones[index % colorTones.length],
        }))
        setProducts(styledProducts)
      }
      setLoading(false)
    }

    loadProducts()

    return () => {
      supabase.removeChannel(settingsSub)
    }
  }, [])

  // Initialize and clean up persistent Realtime Broadcast Channel
  useEffect(() => {
    const channel = supabase.channel('customer-display')
    channelRef.current = channel
    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  function verifyAndLoginPin(pinToTest: string) {
    if (pinToTest.length !== 4) return
    
    supabase
      .from('staff')
      .select('*')
      .eq('pin', pinToTest)
      .single()
      .then(({ data }) => {
        if (data) {
          setActiveStaff(data)
          setEnteredPin('')
          setPinError('')
        } else {
          setPinError('Invalid Staff PIN')
          setTimeout(() => {
            setEnteredPin('')
            setPinError('')
          }, 1200)
        }
      })
  }

  function handlePinInput(digit: string) {
    if (enteredPin.length >= 4) return
    const nextPin = enteredPin + digit
    setEnteredPin(nextPin)
    setPinError('')

    if (nextPin.length === 4) {
      verifyAndLoginPin(nextPin)
    }
  }

  const categories = Array.from(new Set(products.map((p) => p.category)))
  const currentCategories = categories.length > 0 ? categories : ['Drinks', 'Snacks', 'Merch']

  const visibleProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (product.barcode && product.barcode.includes(searchQuery))
    if (searchQuery.trim() !== '') return matchesSearch
    return product.category === activeCategory
  })

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      const matchedProduct = products.find(
        (p) => (p.barcode && p.barcode === searchQuery.trim()) || 
               p.name.toLowerCase() === searchQuery.trim().toLowerCase()
      )

      if (matchedProduct) {
        updateQuantity(matchedProduct.name, 1)
        setSearchQuery('')
      }
    }
  }

>>>>>>> e5e19a5 (Save state before migrating to AI Studio)
  const cartItems = products.filter((product) => cart[product.name])
  const itemCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0)
  const subtotal = cartItems.reduce((sum, product) => sum + product.price * cart[product.name], 0)
  const tax = subtotal * 0.15
  const total = subtotal + tax

<<<<<<< HEAD
=======
  const tenderedAmount = parseFloat(cashTendered) || 0
  const changeDue = Math.max(0, tenderedAmount - total)

  // Broadcast cart update on state change using persistent channel
  useEffect(() => {
    if (!channelRef.current || completedOrder) return

    const formattedCart = cartItems.map((item) => ({
      id: item.id || item.name,
      name: item.name,
      price: item.price,
      quantity: cart[item.name],
    }))

    channelRef.current.send({
      type: 'broadcast',
      event: 'cart-update',
      payload: {
        cart: formattedCart,
        subtotal,
        tax,
        total,
        isAwaitingPayment: isDrawerOpen && !completedOrder,
      },
    })
  }, [cart, subtotal, tax, total, products, isDrawerOpen, completedOrder])

  function handleOpenDrawer() {
    setIsDrawerOpen(true)
  }

  function handleCloseDrawer() {
    setIsDrawerOpen(false)
  }

>>>>>>> e5e19a5 (Save state before migrating to AI Studio)
  function updateQuantity(name: string, change: number) {
    setCart((current) => {
      const nextQuantity = Math.max(0, (current[name] ?? 0) + change)
      const next = { ...current }
      if (nextQuantity === 0) delete next[name]
      else next[name] = nextQuantity
      return next
    })
  }

<<<<<<< HEAD
  return (
    <main className="min-h-screen bg-[#f7f7f5] p-4 text-[#101010] sm:p-7">
      <div className="mx-auto min-h-[calc(100vh-2rem)] max-w-[1384px] rounded-[22px] bg-[#f7f7f5] sm:min-h-[calc(100vh-3.5rem)]">
        <header className="flex items-center gap-3 border-b border-[#deded9] pb-5">
          <div className="grid size-[30px] place-items-center overflow-hidden rounded-[9px] bg-[#101010]">
            <img src="/velora-white.png" alt="Velora" className="size-[19px] object-contain" />
          </div>
          <div className="leading-none">
            <p className="text-[15px] font-semibold tracking-[-0.02em]">velora <span className="font-normal text-[#6d6d69]">checkout</span></p>
            <p className="mt-0.5 text-[11px] text-[#777772]">staff access</p>
          </div>
=======
  async function handleCompletePayment() {
    setIsProcessing(true)

    const orderPayload = {
      total,
      payment_method: paymentMethod,
      staff_name: activeStaff?.name || 'Cashier',
      items: cart,
    }

    const { data, error } = await supabase
      .from('orders')
      .insert([orderPayload])
      .select('id')
      .single()

    if (error) {
      console.error("Failed to save order to Supabase:", error.message, error.details)
      setIsProcessing(false)
      alert("Database error saving order. Check console.")
      return
    }
    
    const orderSummary: CompletedOrder = {
      orderId: data?.id ? String(data.id) : `VEL-${Math.floor(1000 + Math.random() * 9000)}`,
      items: cartItems.map((item) => ({
        name: item.name,
        qty: cart[item.name],
        price: item.price,
      })),
      subtotal,
      tax,
      total,
      paymentMethod,
      cashTendered: paymentMethod === 'cash' ? tenderedAmount : undefined,
      changeDue: paymentMethod === 'cash' ? changeDue : undefined,
      staffName: activeStaff?.name || 'Cashier',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setCompletedOrder(orderSummary)
    setIsProcessing(false)

    // Send single completion signal to customer display
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'order-complete',
        payload: { order: orderSummary },
      })
    }
  }

  async function handleCardPayment() {
    setIsProcessing(true)

    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total }),
      })

      const data = await response.json()

      if (data.error) {
        console.warn("Stripe key not configured yet; proceeding with test order.")
      }

      await handleCompletePayment()
    } catch (err) {
      console.error("Payment error:", err)
      await handleCompletePayment()
    }
  }

  function handleNewSale() {
    setCompletedOrder(null)
    setIsDrawerOpen(false)
    setCart({})
    setCashTendered('')
    setPaymentMethod('card')
  }

  /* ---------------- LOCKED / LOGIN SCREEN ---------------- */
  if (!activeStaff) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-between bg-[#f5f5f3] p-6 text-[#101010]">
        {/* Header Logo */}
        <div className="w-full max-w-5xl flex items-center gap-3 pt-2">
          <div className="grid size-[34px] place-items-center overflow-hidden rounded-[10px] bg-[#101010]">
            <img src="/velora-white.png" alt="Velora" className="size-[20px] object-contain" />
          </div>
          <div className="leading-none">
            <p className="text-[16px] font-bold tracking-[-0.03em]">
              velora <span className="font-normal text-[#6d6d69]">cashier</span>
            </p>
            <p className="mt-0.5 text-[11px] text-[#888883]">staff access</p>
          </div>
        </div>

        {/* Center Keypad Card */}
        <div className="my-auto w-full max-w-[420px] rounded-[32px] bg-white p-10 shadow-sm border border-[#ecece8] text-center">
          <h1 className="text-[32px] font-bold tracking-[-0.05em] text-[#101010]">welcome back.</h1>
          <p className="mt-2 text-[13px] text-[#777772]">Enter your 4-digit staff PIN to continue.</p>

          {/* PIN Indicator Dots */}
          <div className="my-8 flex justify-center gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`size-3.5 rounded-full transition-all duration-200 ${
                  enteredPin.length > i ? 'bg-[#101010] scale-110' : 'bg-[#101010]/20'
                }`}
              />
            ))}
          </div>

          {pinError && <p className="mb-4 text-[12px] font-medium text-[#dc2626]">{pinError}</p>}

          {/* Keypad Buttons Grid */}
          <div className="grid grid-cols-3 gap-3.5">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'submit'].map((btn) => {
              if (btn === 'del') {
                return (
                  <button
                    key={btn}
                    onClick={() => setEnteredPin((prev) => prev.slice(0, -1))}
                    className="flex h-[62px] items-center justify-center rounded-[16px] border border-[#e8e8e3] bg-white text-[#101010] hover:bg-[#f5f5f3] active:scale-95 transition-all"
                  >
                    <Delete className="size-5 stroke-[1.5]" />
                  </button>
                )
              }

              if (btn === 'submit') {
                return (
                  <button
                    key={btn}
                    onClick={() => verifyAndLoginPin(enteredPin)}
                    className="flex h-[62px] items-center justify-center rounded-[16px] border border-[#e8e8e3] bg-white text-[#101010] hover:bg-[#f5f5f3] active:scale-95 transition-all"
                  >
                    <ArrowRight className="size-5 stroke-[1.8]" />
                  </button>
                )
              }

              return (
                <button
                  key={btn}
                  onClick={() => handlePinInput(btn)}
                  className="h-[62px] rounded-[16px] border border-[#e8e8e3] bg-white text-[20px] font-medium text-[#101010] hover:bg-[#f5f5f3] active:scale-95 transition-all"
                >
                  {btn}
                </button>
              )
            })}
          </div>

          {/* Dynamic Footer Store Name */}
          <p className="mt-10 text-[12px] font-medium text-[#888883] tracking-tight">
            {storeName}
          </p>
        </div>

        <div className="pb-2 text-[11px] text-[#aaa]" />
      </main>
    )
  }

  /* ---------------- UNLOCKED CASHIER REGISTER SCREEN ---------------- */
  return (
    <main className="min-h-screen bg-[#f7f7f5] p-4 text-[#101010] sm:p-7 relative">
      <div className="mx-auto min-h-[calc(100vh-2rem)] max-w-[1384px] rounded-[22px] bg-[#f7f7f5] sm:min-h-[calc(100vh-3.5rem)]">
        
        <header className="flex items-center justify-between border-b border-[#deded9] pb-5">
          <div className="flex items-center gap-3">
            <div className="grid size-[30px] place-items-center overflow-hidden rounded-[9px] bg-[#101010]">
              <img src="/velora-white.png" alt="Velora" className="size-[19px] object-contain" />
            </div>
            <div className="leading-none">
              <p className="text-[15px] font-semibold tracking-[-0.02em]">
                velora <span className="font-normal text-[#6d6d69]">checkout</span>
              </p>
              <p className="mt-0.5 text-[11px] text-[#777772]">
                Staff: <span className="font-medium text-[#101010] capitalize">{activeStaff.name} ({activeStaff.role})</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveStaff(null)}
            className="flex items-center gap-2 rounded-lg border border-[#deded9] bg-white px-3 py-1.5 text-xs font-medium hover:bg-[#ebeae7]"
          >
            <LogOut className="size-3.5" /> Lock Register
          </button>
>>>>>>> e5e19a5 (Save state before migrating to AI Studio)
        </header>

        <div className="mt-5 grid gap-0 overflow-hidden rounded-[16px] bg-white lg:grid-cols-[minmax(0,1fr)_424px]">
          <section className="min-w-0 bg-[#f7f7f5] p-4 sm:p-5 lg:pr-14">
            <div className="flex h-14 items-center gap-4 rounded-[12px] bg-white px-5 text-[#777772]">
<<<<<<< HEAD
              <Search className="size-4 text-[#111]" strokeWidth={1.8} aria-hidden="true" />
              <input aria-label="Search products" placeholder="Scan barcode or search products" className="w-full bg-transparent text-[13px] outline-none placeholder:text-[#777772]" />
            </div>
            <div className="mt-6 flex gap-2">
              {categories.map((category) => (
                <button key={category} onClick={() => setActiveCategory(category)} className={`rounded-full border px-7 py-2.5 text-[12px] transition-colors ${activeCategory === category ? 'border-[#101010] bg-[#101010] text-white hover:bg-[#292929]' : 'border-[#d6d6d1] bg-white text-[#101010] hover:border-[#bdbdb7] hover:bg-[#ebeae7]'}`}>
=======
              <Search className="size-4 text-[#111]" strokeWidth={1.8} />
              <input
                autoFocus
                placeholder="Scan barcode or search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full bg-transparent text-[13px] outline-none placeholder:text-[#777772]"
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {currentCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setActiveCategory(category)
                    setSearchQuery('')
                  }}
                  className={`rounded-full border px-7 py-2.5 text-[12px] transition-colors ${
                    activeCategory === category && !searchQuery
                      ? 'border-[#101010] bg-[#101010] text-white hover:bg-[#292929]'
                      : 'border-[#d6d6d1] bg-white text-[#101010] hover:border-[#bdbdb7] hover:bg-[#ebeae7]'
                  }`}
                >
>>>>>>> e5e19a5 (Save state before migrating to AI Studio)
                  {category}
                </button>
              ))}
            </div>
<<<<<<< HEAD
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibleProducts.map((product) => (
                <button key={product.name} onClick={() => updateQuantity(product.name, 1)} className="group rounded-[16px] bg-white p-3.5 text-left transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#101010] focus:ring-offset-2">
                  <div className={`h-24 rounded-[11px] ${product.tone} transition-transform group-hover:scale-[1.01]`} />
                  <p className="mt-3 text-[14px] font-semibold tracking-[-0.02em]">{product.name}</p>
                  <p className="mt-1 text-[12px] text-[#6d6d69]">{money(product.price)}</p>
                </button>
              ))}
=======

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {loading ? (
                <p className="col-span-3 mt-4 text-[13px] text-[#777772]">Loading inventory...</p>
              ) : (
                visibleProducts.map((product) => (
                  <button
                    key={product.name}
                    onClick={() => updateQuantity(product.name, 1)}
                    className="group rounded-[16px] bg-white p-3.5 text-left transition-transform hover:-translate-y-0.5"
                  >
                    <div className={`h-24 rounded-[11px] ${product.tone}`} />
                    <p className="mt-3 text-[14px] font-semibold tracking-[-0.02em]">{product.name}</p>
                    <p className="mt-1 text-[12px] text-[#6d6d69]">{money(product.price)}</p>
                    {product.barcode && (
                      <p className="mt-0.5 text-[10px] text-[#888] font-mono">BC: {product.barcode}</p>
                    )}
                  </button>
                ))
              )}
>>>>>>> e5e19a5 (Save state before migrating to AI Studio)
            </div>
          </section>

          <aside className="flex min-h-[650px] flex-col bg-white p-6 sm:p-7">
            <div>
              <h1 className="text-[21px] font-semibold tracking-[-0.04em]">current sale</h1>
              <p className="mt-0.5 text-[12px] text-[#777772]">{itemCount} items</p>
            </div>
<<<<<<< HEAD
=======

>>>>>>> e5e19a5 (Save state before migrating to AI Studio)
            <div className="mt-5 flex flex-col gap-7">
              {cartItems.map((product) => (
                <div key={product.name} className="grid grid-cols-[minmax(0,1fr)_112px_55px] items-center gap-3 text-[13px]">
                  <span className="truncate">{product.name}</span>
                  <div className="flex items-center justify-center gap-3 text-[#777772]">
<<<<<<< HEAD
                    <button aria-label={`Decrease ${product.name}`} onClick={() => updateQuantity(product.name, -1)} className="grid size-7 place-items-center rounded-full bg-[#eeeeec] text-[#777772] hover:bg-[#e2e2df]"><Minus className="size-3" /></button>
                    <span className="w-3 text-center text-[12px]">{cart[product.name]}</span>
                    <button aria-label={`Increase ${product.name}`} onClick={() => updateQuantity(product.name, 1)} className="grid size-7 place-items-center rounded-full bg-[#eeeeec] text-[#777772] hover:bg-[#e2e2df]"><Plus className="size-3" /></button>
=======
                    <button onClick={() => updateQuantity(product.name, -1)} className="grid size-7 place-items-center rounded-full bg-[#eeeeec] hover:bg-[#e2e2df]"><Minus className="size-3" /></button>
                    <span className="w-3 text-center text-[12px]">{cart[product.name]}</span>
                    <button onClick={() => updateQuantity(product.name, 1)} className="grid size-7 place-items-center rounded-full bg-[#eeeeec] hover:bg-[#e2e2df]"><Plus className="size-3" /></button>
>>>>>>> e5e19a5 (Save state before migrating to AI Studio)
                  </div>
                  <strong className="min-w-[55px] text-right font-medium text-[#101010]">{money(product.price * cart[product.name])}</strong>
                </div>
              ))}
<<<<<<< HEAD
              {cartItems.length === 0 && <p className="text-[13px] text-[#777772]">No items yet. Select a product to start.</p>}
            </div>
            <div className="mt-8 border-t border-[#deded9] pt-5 text-[13px]">
=======
              {cartItems.length === 0 && <p className="text-[13px] text-[#777772]">No items yet.</p>}
            </div>

            <div className="mt-auto pt-8 border-t border-[#deded9] text-[13px]">
>>>>>>> e5e19a5 (Save state before migrating to AI Studio)
              <div className="flex justify-between text-[#777772]"><span>Subtotal</span><span className="text-[#101010]">{money(subtotal)}</span></div>
              <div className="mt-3 flex justify-between text-[#777772]"><span>Tax</span><span className="text-[#101010]">{money(tax)}</span></div>
              <div className="mt-5 flex items-center justify-between text-[17px] font-semibold"><span>Total</span><span className="text-[25px] tracking-[-0.04em]">{money(total)}</span></div>
            </div>
<<<<<<< HEAD
            <button className="mt-8 h-[58px] rounded-[11px] bg-[#101010] text-[14px] font-medium text-white transition-colors hover:bg-[#292929]">Charge {money(total)}</button>
            <div className="mt-4 rounded-[12px] bg-[#e2f2e8] p-4 text-[13px]">
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#17834d]">AI suggestion</p>
              <p className="mt-2">Customer bought coffee</p>
              <div className="mt-1 flex items-center justify-between gap-3"><span>Recommend oat milk alternative</span><strong className="text-[#17834d]">+$0.75</strong></div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
=======

            <button
              disabled={cartItems.length === 0}
              onClick={handleOpenDrawer}
              className="mt-8 h-[58px] w-full rounded-[11px] bg-[#101010] text-[14px] font-medium text-white hover:bg-[#292929] disabled:opacity-50"
            >
              Charge {money(total)}
            </button>
          </aside>
        </div>
      </div>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm">
          <div className="h-full w-full max-w-md bg-white p-7 shadow-2xl flex flex-col justify-between overflow-y-auto">
            
            {!completedOrder ? (
              <>
                <div>
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight">Payment Drawer</h2>
                      <p className="text-xs text-[#777]">Select payment method below</p>
                    </div>
                    <button onClick={handleCloseDrawer} className="rounded-full p-2 hover:bg-[#f0f0f0]">
                      <X className="size-5 text-[#666]" />
                    </button>
                  </div>

                  <div className="my-6 rounded-2xl bg-[#f7f7f5] p-5 text-center border border-[#e5e5e0]">
                    <p className="text-xs text-[#777] uppercase tracking-wider font-semibold">Amount Due</p>
                    <p className="text-4xl font-extrabold text-[#101010] mt-1">{money(total)}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      { id: 'card', label: 'Card Reader', icon: CreditCard },
                      { id: 'cash', label: 'Cash', icon: Banknote },
                      { id: 'qr', label: 'QR Pay', icon: QrCode },
                    ].map((item) => {
                      const Icon = item.icon
                      const active = paymentMethod === item.id
                      return (
                        <button
                          key={item.id}
                          onClick={() => setPaymentMethod(item.id as any)}
                          className={`flex flex-col items-center justify-center p-4 rounded-xl border text-xs font-medium transition-all ${
                            active
                              ? 'border-[#101010] bg-[#101010] text-white shadow-md'
                              : 'border-[#e5e5e0] bg-white text-[#555] hover:border-[#aaa]'
                          }`}
                        >
                          <Icon className="size-5 mb-2" />
                          {item.label}
                        </button>
                      )
                    })}
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="rounded-xl border border-dashed border-[#ccc] p-6 text-center text-xs text-[#666] space-y-3">
                      <CreditCard className="mx-auto size-8 text-[#101010] animate-pulse" />
                      <p className="font-medium text-[#101010]">Card Terminal Ready</p>
                      <p className="text-[11px] text-[#777]">Tap physical card or click below to simulate reader response</p>
                      <button
                        type="button"
                        onClick={handleCardPayment}
                        className="mt-2 rounded-lg bg-[#e2f2e8] px-4 py-2 text-xs font-semibold text-[#17834d] hover:bg-[#d0e8da]"
                      >
                        Simulate Card Tap ({money(total)})
                      </button>
                    </div>
                  )}

                  {paymentMethod === 'cash' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-medium text-[#555]">Cash Tendered ($)</label>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={cashTendered}
                          onChange={(e) => setCashTendered(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-[#ccc] p-3 text-lg font-bold text-[#101010] outline-none focus:border-[#101010]"
                        />
                      </div>

                      <div className="flex gap-2">
                        {[total, 10, 20, 50, 100].map((amt) => (
                          <button
                            key={amt}
                            onClick={() => setCashTendered(amt.toFixed(2))}
                            className="flex-1 rounded-lg border bg-[#f7f7f5] py-2 text-xs font-semibold hover:bg-[#e8e8e3]"
                          >
                            ${amt.toFixed(0)}
                          </button>
                        ))}
                      </div>

                      <div className="flex justify-between items-center rounded-xl bg-[#e2f2e8] p-4 text-[#17834d]">
                        <span className="text-xs font-semibold">Change Due:</span>
                        <span className="text-xl font-bold">{money(changeDue)}</span>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  disabled={isProcessing || (paymentMethod === 'cash' && tenderedAmount < total)}
                  onClick={handleCompletePayment}
                  className="mt-6 h-14 w-full rounded-xl bg-[#101010] text-sm font-semibold text-white hover:bg-[#292929] disabled:opacity-40"
                >
                  {isProcessing ? 'Processing & Saving Order...' : `Complete ${money(total)} Sale`}
                </button>
              </>
            ) : (
              <div className="flex flex-col justify-between h-full">
                <div>
                  <div className="text-center pb-4 border-b">
                    <CheckCircle2 className="mx-auto size-10 text-[#17834d] mb-2" />
                    <h2 className="text-xl font-bold">Payment Successful</h2>
                    <p className="text-xs text-[#777]">Order #{completedOrder.orderId}</p>
                  </div>

                  <div className="my-5 rounded-xl border bg-[#fafafa] p-5 font-mono text-xs text-[#333] shadow-inner space-y-3">
                    <div className="text-center border-b pb-2">
                      <p className="font-bold text-sm tracking-widest uppercase">Velora Retail</p>
                      <p className="text-[10px] text-[#777]">{completedOrder.timestamp} • Staff: {completedOrder.staffName}</p>
                    </div>

                    <div className="space-y-1.5 border-b pb-3">
                      {completedOrder.items.map((item) => (
                        <div key={item.name} className="flex justify-between">
                          <span>{item.qty}x {item.name}</span>
                          <span>{money(item.price * item.qty)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1 text-right">
                      <div className="flex justify-between text-[#666]"><span>Subtotal</span><span>{money(completedOrder.subtotal)}</span></div>
                      <div className="flex justify-between text-[#666]"><span>Tax (15%)</span><span>{money(completedOrder.tax)}</span></div>
                      <div className="flex justify-between font-bold text-sm text-[#101010] pt-1 border-t">
                        <span>TOTAL</span>
                        <span>{money(completedOrder.total)}</span>
                      </div>
                      <p className="text-[10px] text-[#777] capitalize">Paid via {completedOrder.paymentMethod}</p>
                      {completedOrder.changeDue !== undefined && (
                        <p className="text-[10px] text-[#17834d] font-bold">Change Given: {money(completedOrder.changeDue)}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => window.print()}
                      className="flex items-center justify-center gap-2 rounded-xl border border-[#ccc] p-3 text-xs font-semibold hover:bg-[#f0f0f0]"
                    >
                      <Printer className="size-4" /> Print Receipt
                    </button>
                    <button
                      onClick={() => alert('Receipt sent to customer email!')}
                      className="flex items-center justify-center gap-2 rounded-xl border border-[#ccc] p-3 text-xs font-semibold hover:bg-[#f0f0f0]"
                    >
                      <Mail className="size-4" /> Email Receipt
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleNewSale}
                  className="mt-6 h-14 w-full rounded-xl bg-[#101010] text-sm font-semibold text-white hover:bg-[#292929] flex items-center justify-center gap-2"
                >
                  Next Order <ArrowRight className="size-4" />
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </main>
  )
}
>>>>>>> e5e19a5 (Save state before migrating to AI Studio)
