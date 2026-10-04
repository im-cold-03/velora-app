'use client'

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

function money(value: number) {
  return `$${value.toFixed(2)}`
}

export default function Page() {
  const [activeCategory, setActiveCategory] = useState('Drinks')
  const [cart, setCart] = useState(initialCart)

  const visibleProducts = products.filter((product) => product.category === activeCategory)
  const cartItems = products.filter((product) => cart[product.name])
  const itemCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0)
  const subtotal = cartItems.reduce((sum, product) => sum + product.price * cart[product.name], 0)
  const tax = subtotal * 0.15
  const total = subtotal + tax

  function updateQuantity(name: string, change: number) {
    setCart((current) => {
      const nextQuantity = Math.max(0, (current[name] ?? 0) + change)
      const next = { ...current }
      if (nextQuantity === 0) delete next[name]
      else next[name] = nextQuantity
      return next
    })
  }

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
        </header>

        <div className="mt-5 grid gap-0 overflow-hidden rounded-[16px] bg-white lg:grid-cols-[minmax(0,1fr)_424px]">
          <section className="min-w-0 bg-[#f7f7f5] p-4 sm:p-5 lg:pr-14">
            <div className="flex h-14 items-center gap-4 rounded-[12px] bg-white px-5 text-[#777772]">
              <Search className="size-4 text-[#111]" strokeWidth={1.8} aria-hidden="true" />
              <input aria-label="Search products" placeholder="Scan barcode or search products" className="w-full bg-transparent text-[13px] outline-none placeholder:text-[#777772]" />
            </div>
            <div className="mt-6 flex gap-2">
              {categories.map((category) => (
                <button key={category} onClick={() => setActiveCategory(category)} className={`rounded-full border px-7 py-2.5 text-[12px] transition-colors ${activeCategory === category ? 'border-[#101010] bg-[#101010] text-white hover:bg-[#292929]' : 'border-[#d6d6d1] bg-white text-[#101010] hover:border-[#bdbdb7] hover:bg-[#ebeae7]'}`}>
                  {category}
                </button>
              ))}
            </div>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibleProducts.map((product) => (
                <button key={product.name} onClick={() => updateQuantity(product.name, 1)} className="group rounded-[16px] bg-white p-3.5 text-left transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#101010] focus:ring-offset-2">
                  <div className={`h-24 rounded-[11px] ${product.tone} transition-transform group-hover:scale-[1.01]`} />
                  <p className="mt-3 text-[14px] font-semibold tracking-[-0.02em]">{product.name}</p>
                  <p className="mt-1 text-[12px] text-[#6d6d69]">{money(product.price)}</p>
                </button>
              ))}
            </div>
          </section>

          <aside className="flex min-h-[650px] flex-col bg-white p-6 sm:p-7">
            <div>
              <h1 className="text-[21px] font-semibold tracking-[-0.04em]">current sale</h1>
              <p className="mt-0.5 text-[12px] text-[#777772]">{itemCount} items</p>
            </div>
            <div className="mt-5 flex flex-col gap-7">
              {cartItems.map((product) => (
                <div key={product.name} className="grid grid-cols-[minmax(0,1fr)_112px_55px] items-center gap-3 text-[13px]">
                  <span className="truncate">{product.name}</span>
                  <div className="flex items-center justify-center gap-3 text-[#777772]">
                    <button aria-label={`Decrease ${product.name}`} onClick={() => updateQuantity(product.name, -1)} className="grid size-7 place-items-center rounded-full bg-[#eeeeec] text-[#777772] hover:bg-[#e2e2df]"><Minus className="size-3" /></button>
                    <span className="w-3 text-center text-[12px]">{cart[product.name]}</span>
                    <button aria-label={`Increase ${product.name}`} onClick={() => updateQuantity(product.name, 1)} className="grid size-7 place-items-center rounded-full bg-[#eeeeec] text-[#777772] hover:bg-[#e2e2df]"><Plus className="size-3" /></button>
                  </div>
                  <strong className="min-w-[55px] text-right font-medium text-[#101010]">{money(product.price * cart[product.name])}</strong>
                </div>
              ))}
              {cartItems.length === 0 && <p className="text-[13px] text-[#777772]">No items yet. Select a product to start.</p>}
            </div>
            <div className="mt-8 border-t border-[#deded9] pt-5 text-[13px]">
              <div className="flex justify-between text-[#777772]"><span>Subtotal</span><span className="text-[#101010]">{money(subtotal)}</span></div>
              <div className="mt-3 flex justify-between text-[#777772]"><span>Tax</span><span className="text-[#101010]">{money(tax)}</span></div>
              <div className="mt-5 flex items-center justify-between text-[17px] font-semibold"><span>Total</span><span className="text-[25px] tracking-[-0.04em]">{money(total)}</span></div>
            </div>
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
