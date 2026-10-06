'use client'

import { useEffect, useState, useRef } from 'react'
import { ChevronRight, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  detail?: string
}

function money(value: number) {
  return `$${value.toFixed(2)}`
}

export default function Page() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [total, setTotal] = useState<number>(0)
  const [isAwaitingPayment, setIsAwaitingPayment] = useState<boolean>(false)
  const [isCompleted, setIsCompleted] = useState<boolean>(false)
  
  // Dynamic Store Name from Supabase
  const [storeName, setStoreName] = useState<string>('YKK Live Store')

  // Ref to always hold the current isCompleted state without re-subscribing
  const isCompletedRef = useRef(isCompleted)

  useEffect(() => {
    isCompletedRef.current = isCompleted
  }, [isCompleted])

  useEffect(() => {
    // 1. Load Store Settings from Supabase
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

    // 2. Realtime listener for Store Name changes
    const settingsSub = supabase
      .channel('settings-changes-customer')
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

    // 3. Customer display broadcast channel
    const channel = supabase.channel('customer-display')

    channel
      .on('broadcast', { event: 'cart-update' }, (payload) => {
        if (isCompletedRef.current) return

        setCart(payload.payload.cart || [])
        setTotal(payload.payload.total || 0)
        setIsAwaitingPayment(payload.payload.isAwaitingPayment || false)
      })
      .on('broadcast', { event: 'order-complete' }, () => {
        setIsCompleted(true)
        setIsAwaitingPayment(false)

        setTimeout(() => {
          setCart([])
          setTotal(0)
          setIsCompleted(false)
        }, 6000)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      supabase.removeChannel(settingsSub)
    }
  }, [])

  return (
    <main className="min-h-screen bg-[#f5f5f3] p-4 text-[#101010] sm:p-7">
      <div className="mx-auto min-h-[calc(100vh-2rem)] max-w-[1384px] sm:min-h-[calc(100vh-3.5rem)]">
        {/* Header */}
        <header className="flex items-center gap-3 border-b border-[#deded9] pb-5">
          <div className="grid size-[30px] place-items-center overflow-hidden rounded-[9px] bg-[#101010]">
            <img src="/velora-white.png" alt="Velora" className="size-[19px] object-contain" />
          </div>
          <div className="leading-none">
            <p className="text-[15px] font-semibold tracking-[-0.02em]">
              velora <span className="font-normal text-[#6d6d69]">customer checkout</span>
            </p>
            <p className="mt-0.5 text-[11px] text-[#777772]">
              {isCompleted ? 'thank you' : isAwaitingPayment ? 'payment' : cart.length > 0 ? 'checkout' : 'welcome'}
            </p>
          </div>
        </header>

        {/* --- STATE 1: IDLE SCREEN --- */}
        {cart.length === 0 && !isCompleted && (
          <section className="relative mt-5 flex h-[calc(100vh-132px)] min-h-[500px] w-full items-center overflow-hidden rounded-[28px] bg-white p-12 sm:p-16 lg:p-20 shadow-sm border border-[#ecece8]">
            {/* Background Image Layer */}
            <img
              src="/Velora-Customer-Idle.png"
              alt="Customer Idle Background"
              className="absolute inset-0 z-0 h-full w-full object-cover object-right pointer-events-none"
              style={{ opacity: 0.8 }}
            />

            {/* Content Overlay */}
            <div className="relative z-10 max-w-2xl">
              <h1 className="text-[56px] font-bold leading-[1.05] tracking-[-0.05em] sm:text-[72px] lg:text-[80px] text-[#101010]">
                Welcome to {storeName}
              </h1>
              <p className="mt-4 text-[20px] font-normal tracking-tight text-[#666] sm:text-[24px]">
                Waiting for items to be scanned...
              </p>
            </div>
          </section>
        )}

        {/* --- STATE 2: ACTIVE CHECKOUT / PAYMENT SCREEN --- */}
        {cart.length > 0 && !isCompleted && (
          <section className={`mt-5 grid min-h-[calc(100vh-132px)] overflow-hidden rounded-[28px] bg-white shadow-sm border border-[#ecece8] ${
            isAwaitingPayment ? 'lg:grid-cols-[minmax(0,1.03fr)_minmax(0,0.97fr)]' : 'grid-cols-1'
          }`}>
            <div className="flex min-h-0 flex-col bg-white px-8 py-10 sm:px-10 sm:py-12 lg:px-10 lg:py-14">
              <h1 className="shrink-0 text-[58px] font-bold leading-[0.98] tracking-[-0.065em] sm:text-[72px] lg:text-[76px]">
                {isAwaitingPayment ? `Pay ${money(total)}` : 'Checkout'}
              </h1>
              
              <div className="mt-11 min-h-0 overflow-y-auto pr-2 sm:mt-12">
                <div className="flex flex-col gap-5">
                  {cart.map((item) => (
                    <div key={item.id || item.name} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-6">
                      <div className="min-w-0">
                        <p className="text-[21px] font-semibold leading-[1.1] tracking-[-0.035em]">
                          {item.name} {item.quantity > 1 && <span className="text-sm font-normal text-[#777]">(x{item.quantity})</span>}
                        </p>
                        {item.detail && <p className="mt-1 text-[15px] leading-none text-[#777772]">{item.detail}</p>}
                      </div>
                      <p className="pt-0.5 text-right text-[21px] font-semibold leading-[1.1] tracking-[-0.035em]">
                        {money(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {!isAwaitingPayment && (
                <div className="mt-auto pt-6 border-t border-[#deded9] flex justify-between items-center">
                  <span className="text-[20px] font-medium text-[#777772]">Total Due</span>
                  <span className="text-[32px] font-bold tracking-tight">{money(total)}</span>
                </div>
              )}
            </div>

            {isAwaitingPayment && (
              <div className="relative min-h-[430px] border-t border-[#deded9] bg-[#eeeeea] lg:min-h-0 lg:border-l lg:border-t-0 animate-fade-in">
                <div className="absolute inset-0 flex flex-col items-end justify-center gap-40 pr-12 sm:pr-16">
                  <div className="flex items-center gap-6">
                    <span className="text-[23px] font-semibold tracking-[-0.04em]">Tap</span>
                    <ChevronRight className="size-5 transition-transform animate-[translateX_1.2s_ease-in-out_infinite]" strokeWidth={2.2} aria-hidden="true" />
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-[23px] font-semibold tracking-[-0.04em]">Insert</span>
                    <ChevronRight className="size-5 transition-transform animate-[translateX_1.2s_ease-in-out_infinite]" strokeWidth={2.2} aria-hidden="true" />
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* --- STATE 3: ORDER COMPLETED / APPROVED SCREEN --- */}
        {isCompleted && (
          <section className="mt-5 flex min-h-[calc(100vh-132px)] flex-col items-center justify-center rounded-[28px] bg-white p-12 text-center shadow-sm border border-[#ecece8]">
            <CheckCircle2 className="size-20 text-[#17834d] mb-4 animate-bounce" strokeWidth={1.5} />
            <h1 className="text-[52px] font-bold tracking-[-0.05em] text-[#101010]">Payment Approved</h1>
            <p className="mt-2 text-[20px] text-[#777772]">Thank you for shopping with {storeName}!</p>
          </section>
        )}
      </div>

      <style jsx global>{`
        @keyframes translateX {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(8px); }
        }
      `}</style>
    </main>
  )
}