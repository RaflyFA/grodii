'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Archive,
  ArrowLeft,
  ArrowRight,
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  FileText,
  Home,
  Info,
  Layers,
  LogOut,
  MapPin,
  MessageCircle,
  Minus,
  Package,
  Plus,
  QrCode,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Trash2,
  Truck,
  User,
  Wallet,
  WashingMachine,
  X,
} from 'lucide-react'

const products = [
  { name: 'Starter Kit', price: 'Rp 275.000', rawPrice: 275000, category: 'Starter Kit', tone: 'sage', desc: 'Paket lengkap 2 outer, 4 insert, wet bag, laundry bag & box', badge: 'Paket Hemat', badgeType: 'amber', image: '/starter kit.jpg' },
  { name: 'Outer', price: 'Rp 65.000', rawPrice: 65000, category: 'Outer', tone: 'leaf', desc: 'Lapisan luar tahan air dan sirkulasi udara baik', badge: 'Size Modular', badgeType: 'gray', image: '/outer.webp' },
  { name: 'Insert Microfiber', price: 'Rp 29.000', rawPrice: 29000, category: 'Insert', tone: 'sand', desc: 'Bantalan penyerap daya tampung optimal', badge: 'Best Seller', badgeType: 'primary', image: '/Insert Microfiber.webp' },
  { name: 'Size Upgrade', price: 'Rp 48.000', rawPrice: 48000, category: 'Layanan', tone: 'leaf', desc: 'Penyesuaian ukuran popok mengikuti tumbuh kembang bayi', badge: 'Fitur Unggulan', badgeType: 'primary', image: '/size upgrade.webp' },
  { name: 'Cleaning Service', price: 'Rp 24.000', rawPrice: 24000, category: 'Layanan', tone: 'sage', desc: 'Layanan pencucian & perawatan higienis (kapasitas 2 kg)', badge: 'Praktis', badgeType: 'amber', image: '/cleaning service.jpg' },
]

const DIAPER_SIZES = [
  { id: 'S', label: 'Size S', weight: '3 - 7 kg' },
  { id: 'M', label: 'Size M', weight: '7 - 12 kg' },
  { id: 'L', label: 'Size L', weight: '11 - 15 kg' },
  { id: 'XL', label: 'Size XL', weight: '14 - 18 kg' },
  { id: 'XXL', label: 'Size XXL', weight: '> 17 kg' },
] as const

type CartItem = {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  sizeInfo?: string
  sizeFrom?: string
  sizeTo?: string
}

const tabs = [
  { id: 'home', label: 'Beranda', icon: Home },
  { id: 'shop', label: 'Belanja', icon: ShoppingBag },
  { id: 'service', label: 'Layanan', icon: WashingMachine },
  { id: 'account', label: 'Akun', icon: User },
] as const

type Tab = (typeof tabs)[number]['id']

export default function Page() {
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [serviceTab, setServiceTab] = useState<'clean' | 'trade'>('clean')
  const [category, setCategory] = useState('Semua')
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState(true)

  // Cleaning Service Booking Form State
  const [bookingDate, setBookingDate] = useState<'besok' | 'lusa' | 'hari_ini'>('besok')
  const [bookingSlot, setBookingSlot] = useState<'pagi' | 'siang'>('pagi')
  const [bookingWeight, setBookingWeight] = useState<number>(2) // in kg
  const [bookingNotes, setBookingNotes] = useState('')
  const [bookingSuccessModal, setBookingSuccessModal] = useState(false)

  // Trade-in Form State
  const [tradeSelectedOuter, setTradeSelectedOuter] = useState(true)
  const [tradeSelectedInsert, setTradeSelectedInsert] = useState(true)
  const [tradeSuccessModal, setTradeSuccessModal] = useState(false)

  // Size Upgrade Selector State
  const [sizeUpgradeModal, setSizeUpgradeModal] = useState(false)
  const [sizeFrom, setSizeFrom] = useState<string>('M')
  const [sizeTo, setSizeTo] = useState<string>('L')

  // Cart & Checkout State
  const [cart, setCart] = useState<{ [key: string]: CartItem }>({
    'Outer': { id: 'Outer', name: 'Outer', price: 65000, image: '/outer.webp', quantity: 1 }
  })
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout' | 'success'>('cart')
  const [useTradeBalance, setUseTradeBalance] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'cod' | 'ewallet'>('qris')
  const [hasActiveOrder, setHasActiveOrder] = useState(false)
  const [hasActiveTradeIn, setHasActiveTradeIn] = useState(false)
  const [lastOrderedItems, setLastOrderedItems] = useState<CartItem[]>([])

  const cartList = Object.values(cart)
  const cartCount = cartList.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cartList.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tradeDiscount = useTradeBalance && cartCount > 0 ? 50000 : 0
  const finalTotal = Math.max(0, subtotal - tradeDiscount)

  const cleaningCost = (bookingWeight / 2) * 24000
  const tradeEstimatedValue = (tradeSelectedOuter ? 35000 : 0) + (tradeSelectedInsert ? 15000 : 0)

  const addToCart = (product: { name: string; price: string; rawPrice?: number; image: string }) => {
    const rawPrice = product.rawPrice || parseInt(product.price.replace(/[^0-9]/g, '')) || 75000
    setCart((prev) => {
      const existing = prev[product.name]
      if (existing) {
        return { ...prev, [product.name]: { ...existing, quantity: existing.quantity + 1 } }
      }
      return { ...prev, [product.name]: { id: product.name, name: product.name, price: rawPrice, image: product.image, quantity: 1 } }
    })
  }

  const addSizeUpgradeToCart = (from: string, to: string) => {
    const itemId = `Size Upgrade (${from} → ${to})`
    setCart((prev) => {
      const existing = prev[itemId]
      if (existing) {
        return { ...prev, [itemId]: { ...existing, quantity: existing.quantity + 1 } }
      }
      return {
        ...prev,
        [itemId]: {
          id: itemId,
          name: 'Size Upgrade',
          price: 48000,
          image: '/size upgrade.webp',
          quantity: 1,
          sizeInfo: `${from} → ${to}`,
          sizeFrom: from,
          sizeTo: to,
        },
      }
    })
    setSizeUpgradeModal(false)
  }

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      const item = prev[id]
      if (!item) return prev
      const newQty = item.quantity + delta
      if (newQty <= 0) {
        const next = { ...prev }
        delete next[id]
        return next
      }
      return { ...prev, [id]: { ...item, quantity: newQty } }
    })
  }

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const openCart = () => {
    setCheckoutStep('cart')
    setIsCartOpen(true)
  }

  const filteredProducts = useMemo(() => products.filter((product) => {
    const matchesCategory = category === 'Semua' || product.category === category
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  }), [category, search])

  return (
    <main className="min-h-screen bg-page px-0 text-ink antialiased sm:px-4 sm:py-6">
      <div className="relative mx-auto min-h-screen max-w-md overflow-hidden bg-page pb-28 shadow-xl sm:min-h-[840px] sm:rounded-[36px] sm:border sm:border-line">
        
        {/* Header */}
        <header className="flex items-center justify-between px-6 pb-4 pt-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">GRODI / 2026</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">
              {activeTab === 'home' && 'Halo, Bunda Nabila!'}
              {activeTab === 'shop' && 'Belanja Popok'}
              {activeTab === 'service' && 'Layanan Grodi'}
              {activeTab === 'account' && 'Akun Saya'}
            </h1>
          </div>
          <div className="flex items-center gap-2.5">
            <button 
              onClick={openCart}
              aria-label="Buka keranjang belanja" 
              className="relative grid size-11 place-items-center rounded-2xl border border-line bg-card text-primary shadow-xs transition-transform active:scale-95 hover:bg-soft"
            >
              <ShoppingCart className="size-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-white shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('account')}
              aria-label="Buka akun Bunda Nabila" 
              className={`grid size-11 place-items-center rounded-2xl border-2 text-xl shadow-xs transition-all hover:scale-105 active:scale-95 ${
                activeTab === 'account' ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : 'border-primary/20 bg-soft'
              }`}
            >
              👶
            </button>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* TAB 1: BERANDA (HOME)                                                     */}
        {/* ========================================================================= */}
        {activeTab === 'home' && (
          <section className="flex flex-col gap-6 px-6 pb-12 pt-2">
            
            {/* 1. Baby Profile Card */}
            <div className="relative overflow-hidden rounded-[28px] bg-primary p-6 text-white shadow-md shadow-primary/20">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-4">
                  <img src="/profile bayi.webp" alt="Foto Bayi" className="size-16 shrink-0 rounded-full border-2 border-white/20 object-cover shadow-sm" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/80">Profil si kecil</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <h2 className="text-2xl font-extrabold tracking-tight">Bayi A</h2>
                      <ChevronRight className="size-5 text-white/60" />
                    </div>
                    <p className="mt-1 text-sm font-medium text-white/90">
                      Usia 8 Bulan <span className="mx-1 opacity-60">•</span> 8.5 kg
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl bg-white/15 p-2.5 backdrop-blur-sm">
                  <Sparkles aria-hidden="true" className="size-5 text-white" />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between rounded-2xl bg-white/20 px-4 py-3 backdrop-blur-sm">
                <span className="text-xs font-medium text-white/90">Ukuran aktif saat ini</span>
                <span className="rounded-full bg-soft px-3.5 py-1 text-xs font-bold text-ink shadow-xs">
                  Medium (M)
                </span>
              </div>

              <div className="mt-4 flex justify-center gap-1.5">
                <div className="h-1.5 w-4 rounded-full bg-white"></div>
                <div className="h-1.5 w-1.5 rounded-full bg-white/40"></div>
              </div>
            </div>

            {/* 2. 3 PILAR UTAMA GRODI (Hero Action Cards) */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  3 Solusi Sirkular Grodi
                </h3>
                <span className="text-[11px] font-semibold text-primary">Pilihan Layanan</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2.5">
                {/* Pillar 1: Beli Popok */}
                <button 
                  onClick={() => setActiveTab('shop')} 
                  className="group flex flex-col items-center justify-between rounded-2xl border border-line bg-card p-3.5 text-center shadow-xs transition-all hover:border-primary/40 hover:shadow-sm active:scale-95"
                >
                  <div className="grid size-12 place-items-center rounded-2xl bg-soft text-primary shadow-xs transition-transform group-hover:scale-105">
                    <ShoppingBag className="size-6" />
                  </div>
                  <div className="mt-2.5">
                    <p className="text-xs font-bold text-ink">Beli Popok</p>
                    <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary">
                      Stok Baru
                    </span>
                  </div>
                </button>

                {/* Pillar 2: Cuci Popok */}
                <button 
                  onClick={() => {
                    setActiveTab('service')
                    setServiceTab('clean')
                  }} 
                  className="group flex flex-col items-center justify-between rounded-2xl border border-line bg-card p-3.5 text-center shadow-xs transition-all hover:border-primary/40 hover:shadow-sm active:scale-95"
                >
                  <div className="grid size-12 place-items-center rounded-2xl bg-[#9ac1f2]/30 text-primary shadow-xs transition-transform group-hover:scale-105">
                    <WashingMachine className="size-6" />
                  </div>
                  <div className="mt-2.5">
                    <p className="text-xs font-bold text-ink">Cuci Popok</p>
                    <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary">
                      Rp 24rb/2kg
                    </span>
                  </div>
                </button>

                {/* Pillar 3: Tukar Popok */}
                <button 
                  onClick={() => {
                    setActiveTab('service')
                    setServiceTab('trade')
                  }} 
                  className="group flex flex-col items-center justify-between rounded-2xl border border-line bg-card p-3.5 text-center shadow-xs transition-all hover:border-primary/40 hover:shadow-sm active:scale-95"
                >
                  <div className="grid size-12 place-items-center rounded-2xl bg-soft text-primary shadow-xs transition-transform group-hover:scale-105">
                    <RefreshCw className="size-6" />
                  </div>
                  <div className="mt-2.5">
                    <p className="text-xs font-bold text-ink">Tukar Popok</p>
                    <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary">
                      Saldo 50rb
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Growth Notice */}
            {notice && (
              <div className="relative flex items-start gap-3.5 rounded-[24px] border border-alert-strong bg-alert p-5 text-ink shadow-xs">
                <button 
                  onClick={() => setNotice(false)} 
                  aria-label="Tutup notifikasi" 
                  className="absolute right-3.5 top-3.5 rounded-full p-1 text-ink/40 transition-colors hover:bg-black/5 hover:text-ink"
                >
                  <X className="size-4" />
                </button>
                <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-alert-strong text-ink shadow-xs">
                  <Bell className="size-5" />
                </div>
                <div className="pr-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-ink/70">Notifikasi Pertumbuhan</p>
                  <p className="mt-1 text-sm font-semibold leading-snug">Saatnya bersiap upgrade ke Ukuran L!</p>
                  <button 
                    onClick={() => setActiveTab('shop')} 
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary transition-all hover:underline"
                  >
                    Lihat Rekomendasi <ArrowRight className="size-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* 3. Core Service Status */}
            <div className="rounded-[24px] border border-line bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Status Siklus Popok</h3>
                <button 
                  onClick={() => {
                    setActiveTab('service')
                    setServiceTab('clean')
                  }}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Booking Cuci &rarr;
                </button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 divide-x divide-line">
                <div className="flex flex-col pr-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-ink/70">
                    <Package className="size-3.5 text-primary" />
                    <span>Sisa Stok Popok</span>
                  </div>
                  <div className="mt-2 text-xl font-extrabold tracking-tight text-ink">
                    12 <span className="text-sm font-semibold text-primary">Bersih</span>
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-muted-foreground">
                    3 <span className="text-xs">Kotor</span>
                  </div>
                </div>
                <div className="flex flex-col pl-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-ink/70">
                    <Truck className="size-3.5 text-primary" />
                    <span>Jadwal Kurir</span>
                  </div>
                  <div className="mt-2 text-base font-bold leading-tight text-ink">
                    Besok,<br />09:00 WIB
                  </div>
                </div>
              </div>
            </div>

            {/* Active Order Card */}
            {hasActiveOrder && (
              <div className="relative rounded-[24px] border border-primary/20 bg-primary/5 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="grid size-8 place-items-center rounded-full bg-primary/20 text-primary">
                      <Truck className="size-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-ink">Pesanan Berjalan</h3>
                      <p className="text-[10px] font-semibold text-primary">#GRD-20260822-001</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-primary shadow-xs">
                    Sedang Dikemas
                  </span>
                </div>
                
                <div className="relative flex items-center justify-between px-1">
                  <div className="absolute left-1 right-1 top-1/2 -z-10 h-1 -translate-y-1/2 rounded-full bg-line" />
                  <div className="absolute left-1 top-1/2 -z-10 h-1 w-1/2 -translate-y-1/2 rounded-full bg-primary" />
                  
                  <div className="grid size-5 place-items-center rounded-full bg-primary text-white shadow-xs">
                    <Check className="size-3" />
                  </div>
                  <div className="grid size-5 place-items-center rounded-full bg-primary text-white shadow-xs ring-4 ring-primary/20">
                    <Package className="size-3" />
                  </div>
                  <div className="grid size-5 place-items-center rounded-full bg-line text-muted-foreground">
                    <Truck className="size-3" />
                  </div>
                </div>
                
                <div className="mt-3 text-xs text-ink text-center">
                  Estimasi kurir tiba: <span className="font-bold">Besok, 09:00 WIB</span>
                </div>
              </div>
            )}

            {/* Impact / Milestone Card */}
            <div className="rounded-[24px] border border-line bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Dampak baikmu</p>
                  <p className="mt-1.5 max-w-[240px] text-sm font-medium leading-relaxed text-ink">
                    Bulan ini kamu menyelamatkan <span className="font-bold text-primary">45 popok</span> dari tempat sampah!
                  </p>
                </div>
                <div className="grid size-12 place-items-center rounded-2xl bg-soft text-2xl">
                  🌱
                </div>
              </div>
              <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-soft">
                <div className="h-full w-[68%] rounded-full bg-primary transition-all duration-500" />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Target: 65 popok</span>
                <span className="font-semibold text-primary">68% tercapai</span>
              </div>
            </div>

            {/* Personalized Education */}
            <div className="mt-2">
              <div className="flex items-center justify-between px-1 mb-4">
                <h2 className="text-lg font-bold text-ink">Tips Seputar Bayi 8 Bulan</h2>
                <Link href="/bantuan" className="text-xs font-semibold text-primary hover:underline">
                  Pusat Bantuan
                </Link>
              </div>
              <div className="no-scrollbar -mx-6 flex gap-4 overflow-x-auto px-6 pb-2">
                <Link href="/artikel/cegah-ruam" className="flex w-64 shrink-0 flex-col overflow-hidden rounded-[20px] border border-line bg-card shadow-xs transition-shadow hover:shadow-sm">
                  <div className="relative h-32 w-full bg-soft">
                     <img src="/bayi merangkak.jpg" alt="Bayi merangkak" className="h-full w-full object-cover" />
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-2 text-sm font-bold leading-snug text-ink">
                      Cegah Ruam Saat Bayi Aktif Merangkak
                    </h3>
                    <p className="mt-2 text-[11px] font-medium text-muted-foreground">
                      Baca 3 mnt
                    </p>
                  </div>
                </Link>

                <Link href="/artikel/naik-size" className="flex w-64 shrink-0 flex-col overflow-hidden rounded-[20px] border border-line bg-card shadow-xs transition-shadow hover:shadow-sm">
                  <div className="relative h-32 w-full bg-soft">
                     <img src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=400&h=250" alt="Bayi senyum" className="h-full w-full object-cover" />
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-2 text-sm font-bold leading-snug text-ink">
                      Kapan Waktu Tepat Naik Size?
                    </h3>
                    <p className="mt-2 text-[11px] font-medium text-muted-foreground">
                      Baca 2 mnt
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: BELANJA (SHOP)                                                     */}
        {/* ========================================================================= */}
        {activeTab === 'shop' && (
          <section className="flex flex-col gap-4 px-6 pb-12 pt-2">
            {/* Search and Cart */}
            <div className="flex items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3 shadow-xs">
              <Search className="size-4.5 text-muted-foreground" />
              <input 
                aria-label="Cari produk" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                placeholder="Cari popok, insert, outer..." 
                className="w-full bg-transparent text-sm text-ink placeholder:text-muted-foreground outline-none" 
              />
              <button 
                onClick={openCart}
                aria-label="Keranjang" 
                className="relative grid size-9 place-items-center rounded-xl bg-soft text-primary transition-transform active:scale-95"
              >
                <ShoppingCart className="size-4.5" />
                {cartCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-white shadow-xs">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

            {/* Trade-in Balance Banner */}
            <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/10 p-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="grid size-8 place-items-center rounded-lg bg-primary/20 text-primary">
                  <Wallet className="size-4" />
                </div>
                <span className="text-xs font-medium text-primary">
                  Saldo Tukar-Tambah: <strong className="font-bold">Rp 50.000</strong>
                </span>
              </div>
              <button 
                onClick={() => {
                  setActiveTab('service')
                  setServiceTab('trade')
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-primary transition-all hover:underline"
              >
                Tukar Sekarang <ArrowRight className="size-3.5" />
              </button>
            </div>

            {/* Filter Pills */}
            <div className="no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6 pb-1">
              {['Semua', 'Starter Kit', 'Outer', 'Insert', 'Layanan'].map((item) => (
                <button 
                  key={item} 
                  onClick={() => setCategory(item)} 
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                    category === item 
                      ? 'bg-primary text-white shadow-xs shadow-primary/20' 
                      : 'border border-line bg-card text-ink/70 hover:border-primary/40 hover:text-ink'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Recommendations */}
            <div className="mt-1 flex flex-col gap-2.5">
              <h2 className="text-sm font-bold text-ink">Rekomendasi untuk Bayi A (Size M)</h2>
              <div className="no-scrollbar -mx-6 flex gap-3.5 overflow-x-auto px-6 pb-1">
                {/* Rec Card 1 */}
                <article className="flex w-44 shrink-0 flex-col justify-between rounded-[22px] border border-line bg-card p-3 shadow-xs transition-shadow hover:shadow-md">
                  <div>
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-soft">
                      <img src="/outer.webp" alt="Outer Size M" className="h-full w-full object-cover" />
                      <span className="absolute left-2 top-2 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-bold text-ink backdrop-blur-sm">
                        Size M
                      </span>
                    </div>
                    <h3 className="mt-2 text-xs font-bold text-ink">Outer Modular</h3>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">Sesuai paha bayi</p>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs font-bold text-primary">Rp 65.000</p>
                    <button 
                      onClick={() => addToCart({ name: 'Outer', price: 'Rp 65.000', rawPrice: 65000, image: '/outer.webp' })} 
                      className="mt-2 w-full rounded-lg bg-primary py-1.5 text-[11px] font-bold text-white shadow-xs transition-all hover:bg-primary/90 active:scale-95"
                    >
                      + Tambah
                    </button>
                  </div>
                </article>

                {/* Rec Card 2 */}
                <article className="flex w-44 shrink-0 flex-col justify-between rounded-[22px] border border-line bg-card p-3 shadow-xs transition-shadow hover:shadow-md">
                  <div>
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-soft">
                      <img src="/starter kit.jpg" alt="Starter Kit" className="h-full w-full object-cover" />
                      <span className="absolute left-2 top-2 rounded-md bg-[#9ac1f2]/30 px-2 py-0.5 text-[10px] font-bold text-[#003c8d]">
                        Paket Hemat
                      </span>
                    </div>
                    <h3 className="mt-2 text-xs font-bold text-ink">Starter Kit</h3>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">Paket hemat lengkap</p>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs font-bold text-primary">Rp 275.000</p>
                    <button 
                      onClick={() => addToCart({ name: 'Starter Kit', price: 'Rp 275.000', rawPrice: 275000, image: '/starter kit.jpg' })} 
                      className="mt-2 w-full rounded-lg bg-primary py-1.5 text-[11px] font-bold text-white shadow-xs transition-all hover:bg-primary/90 active:scale-95"
                    >
                      + Tambah
                    </button>
                  </div>
                </article>
              </div>
            </div>

            {/* Main Products Grid */}
            <div className="mt-1 flex flex-col gap-2.5">
              <h2 className="text-sm font-bold text-ink">Semua Produk & Layanan</h2>
              <div className="grid grid-cols-2 gap-3.5">
                {filteredProducts.map((product) => (
                  <article key={product.name} className="flex flex-col justify-between rounded-[24px] border border-line bg-card p-3.5 shadow-xs transition-shadow hover:shadow-md">
                    <div>
                      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-soft">
                        <img src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" />
                        {product.badge && (
                          <span className={`absolute left-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            product.badgeType === 'amber' 
                              ? 'bg-[#9ac1f2]/30 text-[#003c8d]' 
                              : product.badgeType === 'gray' 
                              ? 'bg-white/90 text-ink backdrop-blur-sm' 
                              : 'bg-primary text-white'
                          }`}>
                            {product.badge}
                          </span>
                        )}
                      </div>
                      <h3 className="mt-3 text-sm font-bold text-ink">{product.name}</h3>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{product.desc}</p>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-bold text-primary">{product.price}</p>
                      
                      {product.name === 'Cleaning Service' ? (
                        <button 
                          onClick={() => {
                            setActiveTab('service')
                            setServiceTab('clean')
                          }} 
                          className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-primary/90 active:scale-95"
                        >
                          <WashingMachine className="size-3.5" /> Booking Cuci
                        </button>
                      ) : product.name === 'Size Upgrade' ? (
                        <button 
                          onClick={() => setSizeUpgradeModal(true)} 
                          className="mt-2.5 w-full rounded-xl bg-primary py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-primary/90 active:scale-95"
                        >
                          + Tambah
                        </button>
                      ) : (
                        <button 
                          onClick={() => addToCart(product)} 
                          className="mt-2.5 w-full rounded-xl bg-primary py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-primary/90 active:scale-95"
                        >
                          + Tambah
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: LAYANAN (SERVICES: CUCI & TUKAR SUB-TAB TOGGLE)                     */}
        {/* ========================================================================= */}
        {activeTab === 'service' && (
          <section className="flex flex-col gap-5 px-6 pb-12 pt-2">
            
            {/* SUB-TAB BAR (Icon & Teks Saja) */}
            <div className="flex border-b border-line/80 px-1">
              <button
                type="button"
                onClick={() => setServiceTab('clean')}
                className={`relative flex flex-1 items-center justify-center gap-2 pb-3.5 pt-1 text-sm font-bold transition-all ${
                  serviceTab === 'clean'
                    ? 'text-primary font-extrabold'
                    : 'text-ink/60 hover:text-ink font-semibold'
                }`}
              >
                <WashingMachine className={`size-5 ${serviceTab === 'clean' ? 'stroke-[2.5] text-primary' : 'stroke-[1.75]'}`} />
                <span>Cuci Popok</span>
                {serviceTab === 'clean' && (
                  <span className="absolute -bottom-px left-4 right-4 h-0.5 rounded-full bg-primary" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setServiceTab('trade')}
                className={`relative flex flex-1 items-center justify-center gap-2 pb-3.5 pt-1 text-sm font-bold transition-all ${
                  serviceTab === 'trade'
                    ? 'text-primary font-extrabold'
                    : 'text-ink/60 hover:text-ink font-semibold'
                }`}
              >
                <RefreshCw className={`size-5 ${serviceTab === 'trade' ? 'stroke-[2.5] text-primary' : 'stroke-[1.75]'}`} />
                <span>Trade-In</span>
                {serviceTab === 'trade' && (
                  <span className="absolute -bottom-px left-4 right-4 h-0.5 rounded-full bg-primary" />
                )}
              </button>
            </div>

            {/* ==================== SUB-TAB 1: CUCI POPOK ==================== */}
            {serviceTab === 'clean' && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-200">
                
                {/* Hero Card Cuci */}
                <div className="relative overflow-hidden rounded-[28px] bg-primary p-6 text-white shadow-md shadow-primary/20">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold backdrop-blur-sm">
                        <Sparkles className="size-3.5" /> Sterilisasi Higienis
                      </span>
                      <h2 className="mt-3 text-2xl font-extrabold tracking-tight">Grodi Diaper Laundry</h2>
                      <p className="mt-1 text-xs text-white/90 leading-relaxed max-w-[260px]">
                        Layanan cuci popok profesional dengan sterilisasi UV, detergen anti-alergi, dan kurir jemput-antar.
                      </p>
                    </div>
                    <div className="grid size-12 place-items-center rounded-2xl bg-white/15 backdrop-blur-sm">
                      <WashingMachine className="size-6 text-white" />
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-white/20 pt-4">
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-white/75">Tarif Layanan</p>
                      <p className="text-lg font-black">Rp 24.000 <span className="text-xs font-normal text-white/80">/ 2 kg</span></p>
                    </div>
                    <span className="rounded-xl bg-soft px-3 py-1.5 text-xs font-bold text-primary shadow-xs">
                      Door-to-Door
                    </span>
                  </div>
                </div>

                {/* INTERACTIVE BOOKING FORM */}
                <div className="rounded-[24px] border border-line bg-card p-5 shadow-xs">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="size-4 text-primary" />
                    <h3 className="text-sm font-bold text-ink">Formulir Booking Cuci</h3>
                  </div>

                  {/* 1. Pilih Tanggal */}
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-ink mb-2">Pilih Tanggal Penjemputan</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'besok', label: 'Besok', sub: 'Paling Populer' },
                        { id: 'lusa', label: 'Lusa', sub: 'Sesuai Jadwal' },
                        { id: 'hari_ini', label: 'Hari Ini', sub: 'Sore (Express)' },
                      ].map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setBookingDate(d.id as any)}
                          className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                            bookingDate === d.id
                              ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                              : 'border-line bg-page text-ink/70 hover:border-primary/30'
                          }`}
                        >
                          <span className="text-xs font-bold">{d.label}</span>
                          <span className="text-[9px] text-muted-foreground mt-0.5">{d.sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Pilih Sesi Waktu */}
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-ink mb-2">Sesi Waktu Penjemputan</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'pagi', label: 'Sesi Pagi', time: '08:00 - 11:00 WIB' },
                        { id: 'siang', label: 'Sesi Siang', time: '13:00 - 16:00 WIB' },
                      ].map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setBookingSlot(s.id as any)}
                          className={`flex flex-col p-2.5 rounded-xl border text-left transition-all ${
                            bookingSlot === s.id
                              ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                              : 'border-line bg-page text-ink/70 hover:border-primary/30'
                          }`}
                        >
                          <span className="text-xs font-bold">{s.label}</span>
                          <span className="text-[10px] text-muted-foreground mt-0.5">{s.time}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Estimasi Berat */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold text-ink">Estimasi Berat Popok</label>
                      <span className="text-xs font-bold text-primary">Rp {cleaningCost.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { kg: 2, label: '2 kg (~10-14 pcs)', price: 'Rp 24.000' },
                        { kg: 4, label: '4 kg (~20-28 pcs)', price: 'Rp 48.000' },
                        { kg: 6, label: '6 kg (~30-42 pcs)', price: 'Rp 72.000' },
                      ].map((w) => (
                        <button
                          key={w.kg}
                          type="button"
                          onClick={() => setBookingWeight(w.kg)}
                          className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                            bookingWeight === w.kg
                              ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                              : 'border-line bg-page text-ink/70 hover:border-primary/30'
                          }`}
                        >
                          <span className="text-xs font-bold">{w.kg} kg</span>
                          <span className="text-[9px] text-muted-foreground mt-0.5">{w.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4. Alamat Penjemputan */}
                  <div className="mb-4 rounded-xl border border-line bg-page p-3 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-muted-foreground flex items-center gap-1 text-[10px] uppercase">
                        <MapPin className="size-3 text-primary" /> Alamat Penjemputan
                      </span>
                      <span className="text-primary font-bold hover:underline cursor-pointer">Ubah</span>
                    </div>
                    <p className="font-bold text-ink">Rumah Bunda Nabila (0812-3456-7890)</p>
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      Jl. Cempaka Indah No. 45, Kebayoran Baru, Jakarta Selatan
                    </p>
                  </div>

                  {/* 5. Catatan Tambahan */}
                  <div className="mb-5">
                    <label className="block text-xs font-bold text-ink mb-1.5">Catatan Khusus (Opsional)</label>
                    <input 
                      type="text"
                      placeholder="Contoh: Titip di pos satpam jika tidak ada orang" 
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      className="w-full rounded-xl border border-line bg-page px-3.5 py-2 text-xs text-ink placeholder:text-muted-foreground outline-none focus:border-primary"
                    />
                  </div>

                  {/* Submit Booking Button */}
                  <button
                    onClick={() => {
                      setHasActiveOrder(true)
                      setBookingSuccessModal(true)
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90 active:scale-98"
                  >
                    <WashingMachine className="size-4" />
                    <span>Booking Penjemputan Cuci (Rp {cleaningCost.toLocaleString('id-ID')})</span>
                  </button>
                </div>

                {/* 3 Steps Cuci Higienis */}
                <div className="rounded-[24px] border border-line bg-card p-5 shadow-xs">
                  <h3 className="text-sm font-bold text-ink">Standar Kebersihan 3 Tahap Grodi</h3>
                  <div className="mt-4 flex flex-col gap-3.5">
                    {[
                      {
                        step: '1',
                        title: 'Penjemputan Door-to-Door',
                        desc: 'Kurir menjemput popok kotor dalam laundry bag kedap air langsung di rumah Bunda.'
                      },
                      {
                        step: '2',
                        title: 'Sterilisasi Medis & Deterjen Hipoalergenik',
                        desc: 'Dicuci pada suhu terukur, dibilas 4x tanpa pemutih kimiawi, dan disinari UV-C antibakteri.'
                      },
                      {
                        step: '3',
                        title: 'Segel Higienis & Antar Kembali',
                        desc: 'Dikemas rapi dalam kemasan bersegel vakum dan siap pakai kembali dalam 24-48 jam.'
                      }
                    ].map((item) => (
                      <div key={item.step} className="flex items-start gap-3">
                        <div className="grid size-6 shrink-0 place-items-center rounded-full bg-soft text-xs font-bold text-primary">
                          {item.step}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-ink">{item.title}</p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Riwayat Cuci Singkat */}
                <div className="rounded-[24px] border border-line bg-card p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Riwayat Layanan Cuci</h3>
                    <span className="text-[11px] font-semibold text-primary">1x Layanan Selesai</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-line bg-page p-3">
                    <div className="flex items-center gap-3">
                      <div className="grid size-9 place-items-center rounded-lg bg-green-100 text-green-700">
                        <CheckCircle2 className="size-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-ink">Layanan Cuci 2 kg</p>
                        <p className="text-[10px] text-muted-foreground">15 Agustus 2026 • Kurir Antar Selesai</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-ink">Rp 24.000</span>
                  </div>
                </div>

              </div>
            )}

            {/* ==================== SUB-TAB 2: TUKAR POPOK (TRADE-IN) ==================== */}
            {serviceTab === 'trade' && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-200">
                
                {/* Value Card */}
                <div className="rounded-[28px] bg-primary p-6 text-center text-white shadow-md shadow-primary/20">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/80">Estimasi Saldo Tukar Tambah</p>
                  <p className="mt-2 text-3xl font-extrabold tracking-tight">Rp {tradeEstimatedValue.toLocaleString('id-ID')}</p>
                  <p className="mt-1 text-xs text-white/90">Saldo siap digunakan otomatis untuk pembelian berikutnya!</p>
                </div>

                {/* Item Tukar Selection */}
                <div className="rounded-[24px] border border-line bg-card p-5 shadow-xs">
                  <h3 className="text-sm font-bold text-ink">Pilih Popok yang Ingin Ditukar</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">Popok yang sudah kekecilan akan kami daur ulang atau sterilkan kembali.</p>

                  <div className="mt-4 flex flex-col gap-3">
                    {/* Item 1 */}
                    <div 
                      onClick={() => setTradeSelectedOuter(!tradeSelectedOuter)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        tradeSelectedOuter ? 'border-primary bg-primary/5' : 'border-line bg-page'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          checked={tradeSelectedOuter} 
                          onChange={() => {}} 
                          className="size-4 accent-primary" 
                        />
                        <div>
                          <p className="text-xs font-bold text-ink">Outer Modular (Size M)</p>
                          <p className="text-[11px] text-muted-foreground">Kondisi karet elastis baik</p>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-primary">+Rp 35.000</span>
                    </div>

                    {/* Item 2 */}
                    <div 
                      onClick={() => setTradeSelectedInsert(!tradeSelectedInsert)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        tradeSelectedInsert ? 'border-primary bg-primary/5' : 'border-line bg-page'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          checked={tradeSelectedInsert} 
                          onChange={() => {}} 
                          className="size-4 accent-primary" 
                        />
                        <div>
                          <p className="text-xs font-bold text-ink">2x Insert Microfiber Reguler</p>
                          <p className="text-[11px] text-muted-foreground">Daya serap masih layak</p>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-primary">+Rp 15.000</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setTradeSuccessModal(true)
                      setHasActiveTradeIn(true)
                    }}
                    disabled={tradeEstimatedValue === 0}
                    className="mt-4 w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-white shadow-md shadow-primary/25 transition-all hover:bg-primary/90 active:scale-98 disabled:opacity-50"
                  >
                    Ajukan Trade-In
                  </button>
                </div>

                {/* Steps Container */}
                <div className="rounded-[24px] border border-line bg-card p-5 shadow-xs">
                  <h2 className="text-base font-bold text-ink">Semudah 1—2—3</h2>
                  <div className="mt-4 flex flex-col gap-4">
                    {[
                      [Package, 'Pilih & Kemas Popok', 'Pilih popok yang sudah dicuci bersih untuk ditukarkan.'],
                      [QrCode, 'Ajukan & Dapatkan Kode', 'Dapatkan kode booking serta QR Code setelah konfirmasi.'],
                      [MapPin, 'Datang ke Kantor Grodi', 'Bawa popok dan tunjukkan kode booking kepada petugas kami.'],
                    ].map(([Icon, title, detail], index) => {
                      const StepIcon = Icon as typeof WashingMachine
                      return (
                        <div className="flex items-center gap-3.5" key={title as string}>
                          <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-soft text-primary shadow-xs">
                            <StepIcon className="size-5" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-ink">{index + 1}. {title as string}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{detail as string}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

              </div>
            )}

          </section>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: AKUN (ACCOUNT & INVENTORY INTEGRATION)                             */}
        {/* ========================================================================= */}
        {activeTab === 'account' && (
          <section className="flex flex-col gap-5 px-6 pb-12 pt-2 animate-in fade-in duration-200">
            
            {/* User Profile Header Card */}
            <div className="overflow-hidden rounded-[28px] bg-primary p-6 text-white shadow-md shadow-primary/20">
              <div className="flex items-center gap-4">
                <div className="size-16 overflow-hidden rounded-full border-2 border-white/20 bg-white shadow-sm">
                  <img src="/profile bayi.webp" alt="Foto Bayi" className="h-full w-full object-cover" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold tracking-tight">Bunda Nabila</h3>
                  <p className="mt-0.5 text-xs text-white/80">0812-3456-7890</p>
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold backdrop-blur-sm">
                    <Sparkles className="size-3" /> Member Grodi Sirkular
                  </span>
                </div>
              </div>

              {/* Saldo & Poin Mini Bar */}
              <div className="mt-5 grid grid-cols-2 gap-2 border-t border-white/20 pt-4">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-semibold text-white/75">Saldo Tukar</span>
                  <span className="text-base font-extrabold">Rp 50.000</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-semibold text-white/75">Poin Hijau</span>
                  <span className="text-base font-extrabold">450 Poin 🌱</span>
                </div>
              </div>
            </div>

            {/* INVENTARIS & SIMPANAN POPOK AKTIF (Moved from Stash) */}
            <div className="rounded-[24px] border border-line bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-ink flex items-center gap-1.5">
                    <Archive className="size-4 text-primary" /> Inventaris Popok Si Kecil
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Pantau siklus pemakaian popok kainmu.</p>
                </div>
                <button 
                  onClick={() => setActiveTab('shop')} 
                  className="rounded-xl bg-soft px-3 py-1 text-[11px] font-bold text-primary hover:bg-primary hover:text-white transition-all"
                >
                  + Tambah
                </button>
              </div>

              <div className="flex flex-col gap-3 mt-4">
                {/* Outer Item */}
                <div className="rounded-2xl border border-line bg-page p-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-ink">4x Outer Size M</p>
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-primary">
                        <Check className="size-3" /> Kondisi Sangat Baik
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        setActiveTab('service')
                        setServiceTab('trade')
                      }}
                      className="rounded-lg border border-primary/30 bg-card px-2.5 py-1 text-[10px] font-bold text-primary hover:bg-primary/10 transition-colors"
                    >
                      Tukar
                    </button>
                  </div>
                </div>

                {/* Insert Item */}
                <div className="rounded-2xl border border-line bg-page p-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-ink">12x Insert Microfiber Reguler</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">80% siklus optimal</p>
                    </div>
                    <button 
                      onClick={() => {
                        setActiveTab('service')
                        setServiceTab('clean')
                      }}
                      className="rounded-lg border border-primary/30 bg-card px-2.5 py-1 text-[10px] font-bold text-primary hover:bg-primary/10 transition-colors"
                    >
                      Cuci
                    </button>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-soft">
                      <div className="h-full w-[80%] rounded-full bg-primary" />
                    </div>
                    <span className="text-[10px] font-bold text-ink">80%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIWAYAT PESANAN */}
            <div className="rounded-[24px] border border-line bg-card p-5 shadow-xs">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Package className="size-4 text-primary" /> Riwayat Transaksi & Layanan
              </h3>
              
              <div className="flex flex-col gap-3">
                {/* 1. Active Trade-In Item (Clickable to re-open QR Modal) */}
                {hasActiveTradeIn && (
                  <div 
                    onClick={() => setTradeSuccessModal(true)}
                    role="button"
                    tabIndex={0}
                    className="group relative cursor-pointer rounded-2xl border-2 border-primary/40 bg-primary/5 p-4 shadow-xs transition-all hover:border-primary hover:bg-primary/10 active:scale-[0.99]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-ink/60">#TRD-20260901-012</span>
                      <span className="rounded-full bg-amber-500/15 border border-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-700 flex items-center gap-1">
                        <Clock className="size-3" /> Menunggu Drop-off
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="grid size-10 place-items-center rounded-xl bg-primary text-white shadow-xs group-hover:scale-105 transition-transform">
                          <QrCode className="size-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-ink">Trade-In Popok</p>
                            <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold text-primary">Lihat QR</span>
                          </div>
                          <p className="text-[11px] font-medium text-muted-foreground">Silakan bawa ke Kantor Pusat Grodi</p>
                        </div>
                      </div>
                      <ChevronRight className="size-4 text-primary/60 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                )}

                {/* 2. Active Order / Cleaning Service Item */}
                {hasActiveOrder && (
                  <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-ink/60">#LND-20260901-088</span>
                      <span className="rounded-full bg-blue-500/15 border border-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-700 flex items-center gap-1">
                        <Truck className="size-3" /> Sedang Dijemput
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                        <WashingMachine className="size-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-ink">Layanan Cuci 2 kg</p>
                        <p className="text-[11px] font-medium text-muted-foreground">Kurir sedang menuju lokasi Anda</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Completed Trade-In History */}
                <div className="rounded-2xl border border-line bg-page p-3.5 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-ink/60">#TRD-20260815-004</span>
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700 flex items-center gap-1">
                      <CheckCircle2 className="size-3" /> Selesai
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-xl bg-soft text-primary">
                      <RefreshCw className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-ink">Trade-In Popok (Berhasil)</p>
                      <p className="text-[11px] font-semibold text-primary">+Rp 50.000 Saldo Masuk</p>
                    </div>
                  </div>
                </div>

                {/* 4. Completed Shop Order Item */}
                <div className="rounded-2xl border border-line bg-page p-3.5 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-ink/60">#GRD-20260710-045</span>
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700 flex items-center gap-1">
                      <CheckCircle2 className="size-3" /> Selesai
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-xl bg-soft text-primary">
                      <ShoppingBag className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-ink">Starter Kit Popok Kain</p>
                      <p className="text-[11px] font-medium text-muted-foreground">Total: Rp 275.000 • Pesanan telah diterima</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PENGATURAN AKUN */}
            <div className="rounded-[24px] border border-line bg-card p-5 shadow-xs">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Settings className="size-4 text-primary" /> Pengaturan & Layanan
              </h3>
              
              <div className="flex flex-col rounded-2xl border border-line bg-page shadow-xs">
                {[
                  { icon: MapPin, label: 'Daftar Alamat Penjemputan', detail: 'Kebayoran Baru' },
                  { icon: User, label: 'Profil Bayi A', detail: '8 Bulan (M)' },
                  { icon: CreditCard, label: 'Metode Pembayaran', detail: 'QRIS / BCA' },
                ].map((item, i) => {
                  const Icon = item.icon
                  return (
                    <button key={item.label} className={`flex items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-soft ${i !== 0 ? 'border-t border-line' : ''}`}>
                      <div className="flex items-center gap-3 text-ink">
                        <Icon className="size-4 text-primary" />
                        <div>
                          <p className="text-xs font-semibold">{item.label}</p>
                          <p className="text-[10px] text-muted-foreground">{item.detail}</p>
                        </div>
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground/50" />
                    </button>
                  )
                })}
                <Link href="/bantuan" className="flex items-center justify-between border-t border-line px-4 py-3.5 text-left transition-colors hover:bg-soft">
                  <div className="flex items-center gap-3 text-ink">
                    <MessageCircle className="size-4 text-primary" />
                    <div>
                      <p className="text-xs font-semibold">Pusat Bantuan & FAQ</p>
                      <p className="text-[10px] text-muted-foreground">Hubungi tim Grodi</p>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground/50" />
                </Link>
              </div>

              <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-3 text-xs font-bold text-red-600 transition-colors hover:bg-red-100">
                <LogOut className="size-4" /> Keluar Akun
              </button>
            </div>

          </section>
        )}

        {/* ========================================================================= */}
        {/* BOTTOM NAVIGATION (4 TABS)                                                */}
        {/* ========================================================================= */}
        <nav 
          aria-label="Navigasi utama" 
          className="fixed bottom-0 left-1/2 z-20 flex w-full max-w-md -translate-x-1/2 justify-around border-t border-line/80 bg-white/95 px-3 py-2.5 backdrop-blur-md sm:rounded-b-[36px]"
        >
          <div className="flex w-full justify-around">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button 
                key={id} 
                onClick={() => setActiveTab(id)} 
                aria-current={activeTab === id ? 'page' : undefined} 
                className={`flex min-w-[72px] flex-col items-center gap-1 rounded-2xl py-1.5 text-xs font-semibold transition-all ${
                  activeTab === id 
                    ? 'bg-soft font-bold text-primary' 
                    : 'text-muted-foreground hover:text-ink'
                }`}
              >
                <Icon className={`size-5 ${activeTab === id ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* ========================================================================= */}
        {/* MODAL: BOOKING CUCI SUCCESS POPUP                                         */}
        {/* ========================================================================= */}
        {bookingSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-[32px] bg-card p-6 text-center shadow-2xl">
              <div className="mx-auto grid size-16 place-items-center rounded-full bg-primary/15 text-primary">
                <CheckCircle2 className="size-10" />
              </div>
              <h3 className="mt-4 text-xl font-extrabold text-ink">Booking Cuci Berhasil!</h3>
              <p className="mt-1 text-xs font-semibold text-primary">No. Resi: #LND-20260901-088</p>
              
              <div className="my-4 rounded-2xl border border-line bg-page p-3.5 text-left text-xs space-y-1.5">
                <div className="flex justify-between text-muted-foreground">
                  <span>Jadwal Penjemputan:</span>
                  <span className="font-bold text-ink uppercase">{bookingDate} ({bookingSlot})</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Estimasi Berat:</span>
                  <span className="font-bold text-ink">{bookingWeight} kg</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Total Biaya:</span>
                  <span className="font-bold text-primary">Rp {cleaningCost.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Silakan siapkan popok kotor di dalam kantong laundry Grodi. Kurir kami akan mengabari sebelum tiba di lokasi.
              </p>

              <button
                onClick={() => {
                  setBookingSuccessModal(false)
                  setActiveTab('home')
                }}
                className="mt-6 w-full rounded-2xl bg-primary py-3.5 text-xs font-bold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95"
              >
                Lihat di Beranda
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: TRADE-IN SUCCESS POPUP                                             */}
        {/* ========================================================================= */}
        {tradeSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-[32px] bg-card p-6 text-center shadow-2xl">
              <div className="mx-auto grid size-14 place-items-center rounded-full bg-primary/15 text-primary">
                <CheckCircle2 className="size-8" />
              </div>
              <h3 className="mt-3 text-xl font-extrabold text-ink">Pengajuan Trade-In Berhasil!</h3>
              <p className="mt-0.5 text-xs font-semibold text-primary">Kode Booking: #TRD-20260901-012</p>
              
              {/* QR Code Card */}
              <div className="my-3.5 flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary/40 bg-soft/60 p-4">
                <div className="rounded-xl bg-white p-2.5 shadow-xs">
                  <QrCode className="size-24 text-primary" />
                </div>
                <span className="mt-2 font-mono text-xs font-extrabold tracking-wider text-primary">TRD-20260901-012</span>
                <span className="text-[10px] text-muted-foreground">Tunjukkan QR atau kode ini ke petugas kantor</span>
              </div>

              {/* Office Location & Info */}
              <div className="mb-3.5 rounded-2xl border border-line bg-page p-3 text-left text-xs space-y-1.5">
                <div className="flex justify-between text-muted-foreground">
                  <span>Estimasi Saldo:</span>
                  <span className="font-bold text-primary">+Rp {tradeEstimatedValue.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-start text-muted-foreground">
                  <span className="shrink-0">Lokasi Drop-off:</span>
                  <span className="font-bold text-ink text-right">Kantor Grodi (Kebayoran Baru)</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Jam Operasional:</span>
                  <span className="font-semibold text-ink">08:00 - 17:00 WIB</span>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Silakan bawa popok lama Anda yang sudah bersih ke Kantor Grodi. Saldo akan otomatis ditambahkan ke akun setelah proses verifikasi petugas.
              </p>

              <button
                onClick={() => {
                  setTradeSuccessModal(false)
                  setActiveTab('account')
                }}
                className="mt-5 w-full rounded-2xl bg-primary py-3.5 text-xs font-bold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95"
              >
                Tutup & Siapkan Popok
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: SIZE UPGRADE SELECTION POPUP                                       */}
        {/* ========================================================================= */}
        {sizeUpgradeModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-t-[32px] sm:rounded-[32px] bg-card p-6 shadow-2xl animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  
                  <div>
                    <h3 className="text-base font-extrabold text-ink">Pilih Ukuran Size Upgrade</h3>
                    
                  </div>
                </div>
                <button
                  onClick={() => setSizeUpgradeModal(false)}
                  className="grid size-8 place-items-center rounded-full bg-soft text-ink/60 hover:text-ink transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Step 1: Ukuran Awal */}
              <div className="mt-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                    
                    Ukuran Popok Saat Ini (Asal)
                  </label>
                  <span className="text-[11px] font-bold text-primary">Pilihan: Size {sizeFrom}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {DIAPER_SIZES.slice(0, 4).map((size) => {
                    const isSelected = sizeFrom === size.id
                    return (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => {
                          setSizeFrom(size.id)
                          // Jika sizeTo saat ini <= ukuran baru, otomatis geser sizeTo ke ukuran berikutnya
                          const newFromIdx = DIAPER_SIZES.findIndex((s) => s.id === size.id)
                          const toIdx = DIAPER_SIZES.findIndex((s) => s.id === sizeTo)
                          if (toIdx <= newFromIdx) {
                            setSizeTo(DIAPER_SIZES[Math.min(newFromIdx + 1, DIAPER_SIZES.length - 1)].id)
                          }
                        }}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'border-primary bg-primary text-white font-bold shadow-xs shadow-primary/25'
                            : 'border-line bg-page text-ink/80 hover:border-primary/40'
                        }`}
                      >
                        <span className="text-xs font-extrabold">{size.label}</span>
                        <span className={`text-[9px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>
                          {size.weight}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Arrow separator divider */}
              <div className="my-3 flex items-center justify-center gap-2">
                <div className="h-px flex-1 bg-line" />
                
                <div className="h-px flex-1 bg-line" />
              </div>

              {/* Step 2: Ukuran Upgrade (Tujuan) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                    
                    Ukuran Baru
                  </label>
                  <span className="text-[11px] font-bold text-primary">Target: Size {sizeTo}</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {DIAPER_SIZES.map((size, idx) => {
                    const fromIdx = DIAPER_SIZES.findIndex((s) => s.id === sizeFrom)
                    const isDisabled = idx <= fromIdx
                    const isSelected = sizeTo === size.id

                    return (
                      <button
                        key={size.id}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => setSizeTo(size.id)}
                        className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'border-primary bg-primary text-white font-bold shadow-xs shadow-primary/25'
                            : isDisabled
                            ? 'border-dashed border-line bg-muted/40 text-muted-foreground/40 cursor-not-allowed opacity-60'
                            : 'border-line bg-page text-ink/80 hover:border-primary/40'
                        }`}
                      >
                        <span className="text-xs font-extrabold">{size.id}</span>
                        <span className={`text-[8px] mt-0.5 leading-tight ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>
                          {isDisabled ? '≤ Asal' : size.weight.split(' ')[0]}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Summary Highlight Box */}
              <div className="mt-4 rounded-2xl border border-primary/20 bg-soft/70 p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="grid size-9 place-items-center rounded-xl  text-ink font-bold text-lg ">
                    {sizeFrom}
                  </div>
                  <ArrowRight className="size-4 text-primary font-bold animate-pulse" />
                  <div className="grid size-9 place-items-center rounded-xl  text-ink font-bold text-lg">
                    {sizeTo}
                  </div>
                  
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground">Biaya Layanan</p>
                  <p className="text-xs font-extrabold text-primary">Rp 48.000</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setSizeUpgradeModal(false)}
                  className="w-1/3 rounded-2xl border border-line py-3 text-xs font-bold text-ink hover:bg-soft transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => addSizeUpgradeToCart(sizeFrom, sizeTo)}
                  className="w-2/3 rounded-2xl bg-primary py-3 text-xs font-bold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95"
                >
                  + Tambah ke Keranjang
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CART & CHECKOUT MODAL                                                     */}
        {/* ========================================================================= */}
        {isCartOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs transition-opacity sm:items-center">
            <div className={`relative w-full max-w-md bg-card transition-all duration-300 shadow-2xl ${
              checkoutStep === 'success' 
                ? 'm-4 rounded-[32px] p-6 text-center animate-in fade-in zoom-in-95' 
                : 'rounded-t-[32px] max-h-[85vh] flex flex-col sm:rounded-[32px]'
            }`}>

              {/* STEP 1: CART VIEW */}
              {checkoutStep === 'cart' && (
                <div className="flex flex-col max-h-[80vh]">
                  <div className="flex items-center justify-between border-b border-line px-6 py-4">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="size-5 text-primary" />
                      <h2 className="text-base font-bold text-ink">Keranjang Belanja ({cartCount})</h2>
                    </div>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="grid size-8 place-items-center rounded-full bg-soft text-ink/60 hover:text-ink transition-colors"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  <div className="no-scrollbar overflow-y-auto px-6 py-4 flex-1 flex flex-col gap-3">
                    {cartList.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="grid size-16 place-items-center rounded-full bg-soft text-primary/60">
                          <ShoppingBag className="size-8" />
                        </div>
                        <p className="mt-4 text-base font-bold text-ink">Keranjangmu Masih Kosong</p>
                        <p className="mt-1 text-xs text-muted-foreground">Yuk tambah popok kain ramah lingkungan untuk si kecil!</p>
                        <button 
                          onClick={() => { setIsCartOpen(false); setActiveTab('shop'); }}
                          className="mt-6 rounded-2xl bg-primary px-6 py-3 text-xs font-bold text-white shadow-sm transition-transform active:scale-95"
                        >
                          Mulai Belanja
                        </button>
                      </div>
                    ) : (
                      cartList.map((item) => (
                        <div key={item.id} className="flex items-center gap-3.5 rounded-2xl border border-line bg-page p-3 shadow-xs">
                          <img src={item.image} alt={item.name} className="size-16 shrink-0 rounded-xl object-cover" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                              <h3 className="truncate text-xs font-bold text-ink">{item.name}</h3>
                              <button 
                                onClick={() => removeFromCart(item.id)}
                                className="p-0.5 text-ink/40 hover:text-red-600 transition-colors"
                                aria-label="Hapus item"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>

                            {item.sizeInfo && (
                              <div className="mt-1 flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                                  <Layers className="size-3" /> Size: {item.sizeInfo}
                                </span>
                              </div>
                            )}

                            <p className="mt-1 text-xs font-extrabold text-primary">Rp {(item.price).toLocaleString('id-ID')}</p>
                            
                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex items-center gap-2 rounded-lg border border-line bg-card px-2 py-1">
                                <button 
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className="text-ink/60 hover:text-ink transition-colors"
                                >
                                  <Minus className="size-3.5" />
                                </button>
                                <span className="text-xs font-bold text-ink px-1">{item.quantity}</span>
                                <button 
                                  onClick={() => updateQuantity(item.id, 1)}
                                  className="text-ink/60 hover:text-ink transition-colors"
                                >
                                  <Plus className="size-3.5" />
                                </button>
                              </div>
                              <span className="text-[11px] font-bold text-ink/70">
                                Total: Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {cartList.length > 0 && (
                    <div className="border-t border-line bg-card p-6 flex flex-col gap-3">
                      <div className="flex items-center justify-between text-sm font-semibold">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="text-base font-extrabold text-ink">Rp {subtotal.toLocaleString('id-ID')}</span>
                      </div>
                      <button 
                        onClick={() => setCheckoutStep('checkout')}
                        className="w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90 active:scale-98"
                      >
                        Lanjut ke Pembayaran <ArrowRight className="inline-block size-4 ml-1" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: CHECKOUT VIEW */}
              {checkoutStep === 'checkout' && (
                <div className="flex flex-col max-h-[82vh]">
                  <div className="flex items-center justify-between border-b border-line px-6 py-4">
                    <button 
                      onClick={() => setCheckoutStep('cart')}
                      className="grid size-8 place-items-center rounded-full bg-soft text-ink hover:bg-line transition-colors"
                    >
                      <ArrowLeft className="size-4" />
                    </button>
                    <h2 className="text-base font-bold text-ink">Ringkasan Pembayaran</h2>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="grid size-8 place-items-center rounded-full bg-soft text-ink/60 hover:text-ink transition-colors"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  <div className="no-scrollbar overflow-y-auto px-6 py-4 flex flex-col gap-4">
                    
                    {/* Ringkasan Produk & Ukuran */}
                    <div className="rounded-2xl border border-line bg-page p-4">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <ShoppingBag className="size-3.5 text-primary" /> Produk Dipesan ({cartCount})
                        </span>
                        <button 
                          onClick={() => setCheckoutStep('cart')}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          Ubah
                        </button>
                      </div>
                      <div className="flex flex-col gap-2.5 divide-y divide-line/60">
                        {cartList.map((item) => (
                          <div key={item.id} className="pt-2 first:pt-0 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img src={item.image} alt={item.name} className="size-10 rounded-xl object-cover shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-ink truncate">{item.name}</p>
                                {item.sizeInfo ? (
                                  <div className="mt-0.5 flex items-center gap-1">
                                    <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                                      <Layers className="size-3" /> Size: {item.sizeInfo}
                                    </span>
                                  </div>
                                ) : (
                                  <p className="text-[10px] text-muted-foreground">Kuantitas: {item.quantity} pcs</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xs font-bold text-ink">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                              {item.sizeInfo && (
                                <p className="text-[10px] text-muted-foreground">Qty: {item.quantity}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Alamat Pengiriman */}
                    <div className="rounded-2xl border border-line bg-page p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <MapPin className="size-3.5 text-primary" /> Alamat Pengiriman
                        </span>
                        <span className="text-xs font-semibold text-primary cursor-pointer hover:underline">Ubah</span>
                      </div>
                      <p className="text-xs font-bold text-ink">Bunda Nabila (0812-3456-7890)</p>
                      <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                        Jl. Cempaka Indah No. 45, Kebayoran Baru, Jakarta Selatan, 12150
                      </p>
                    </div>

                    {/* Metode Pembayaran */}
                    <div>
                      <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Metode Pembayaran</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'qris', label: 'QRIS / BCA', icon: QrCode },
                          { id: 'cod', label: 'COD (Bayar)', icon: Truck },
                          { id: 'ewallet', label: 'GoPay / OVO', icon: Wallet },
                        ].map((m) => {
                          const IconComp = m.icon
                          return (
                            <button
                              key={m.id}
                              onClick={() => setPaymentMethod(m.id as any)}
                              className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                                paymentMethod === m.id
                                  ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                                  : 'border-line bg-page text-ink/70 hover:border-primary/40'
                              }`}
                            >
                              <IconComp className="size-5 mb-1.5" />
                              <span className="text-[10px] leading-tight font-semibold">{m.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Toggle Saldo Tukar */}
                    <div className="flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/10 p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="grid size-8 place-items-center rounded-lg bg-primary/20 text-primary">
                          <Wallet className="size-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-ink">Gunakan Saldo Tukar-Tambah</p>
                          <p className="text-[11px] font-semibold text-primary">Hemat Rp 50.000</p>
                        </div>
                      </div>
                      <input 
                        type="checkbox"
                        checked={useTradeBalance}
                        onChange={(e) => setUseTradeBalance(e.target.checked)}
                        className="size-5 accent-primary cursor-pointer"
                      />
                    </div>

                    {/* Rincian Tagihan */}
                    <div className="rounded-2xl border border-line bg-page p-4 flex flex-col gap-2 text-xs">
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Rincian Biaya</h3>
                      <div className="flex justify-between text-ink/80">
                        <span>Subtotal Produk</span>
                        <span className="font-semibold">Rp {subtotal.toLocaleString('id-ID')}</span>
                      </div>
                      {useTradeBalance && (
                        <div className="flex justify-between text-primary font-medium">
                          <span>Diskon Saldo Tukar</span>
                          <span className="font-bold">-Rp 50.000</span>
                        </div>
                      )}
                      <div className="flex justify-between text-ink/80">
                        <span>Ongkos Kirim</span>
                        <span className="font-semibold text-green-600">Gratis (Promo)</span>
                      </div>

                      {/* Keterangan Layanan Size Upgrade */}
                      {cartList.some((i) => i.sizeInfo) && (
                        <div className="my-1 rounded-xl bg-primary/5 p-2.5 border border-primary/15 text-[11px] text-ink/80 flex items-start gap-2">
                          <Layers className="size-3.5 text-primary shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-primary">Penyesuaian Ukuran Popok:</span>
                            <div className="mt-0.5 space-y-0.5">
                              {cartList.filter((i) => i.sizeInfo).map((i) => (
                                <p key={i.id}>
                                  • Size {i.sizeInfo} (x{i.quantity})
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-2 border-t border-line pt-2 flex justify-between items-center text-sm font-bold text-ink">
                        <span>Total Pembayaran</span>
                        <span className="text-base font-extrabold text-primary">Rp {finalTotal.toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                  </div>

                  <div className="border-t border-line bg-card p-6">
                    <button 
                      onClick={() => {
                        setLastOrderedItems(cartList)
                        setHasActiveOrder(true)
                        setCheckoutStep('success')
                        setCart({})
                      }}
                      className="w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90 active:scale-98"
                    >
                      Pesan Sekarang (Rp {finalTotal.toLocaleString('id-ID')})
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: SUCCESS POPUP */}
              {checkoutStep === 'success' && (
                <div className="flex flex-col items-center justify-center py-4 px-2">
                  <div className="grid size-20 place-items-center rounded-full bg-primary/15 text-primary">
                    <CheckCircle2 className="size-12" />
                  </div>
                  <h2 className="mt-4 text-xl font-extrabold text-ink">Pesanan Berhasil!</h2>
                  <p className="mt-1 text-xs font-semibold text-primary">No. Pesanan: #GRD-20260822-001</p>
                  
                  <p className="mt-3 text-xs text-muted-foreground leading-relaxed max-w-xs text-center">
                    Terima kasih Bunda Nabila! Pesananmu sedang diproses dan kurir kami akan segera mengantarkannya.
                  </p>

                  {/* Keterangan Size Upgrade jika ada */}
                  {lastOrderedItems.some((i) => i.sizeInfo) && (
                    <div className="mt-4 w-full rounded-2xl border border-primary/20 bg-primary/5 p-3.5 text-left text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-primary mb-1.5">
                        <Layers className="size-4" />
                        <span>Layanan Penyesuaian Ukuran Terjadwal</span>
                      </div>
                      <div className="space-y-1 text-ink/80 text-[11px]">
                        {lastOrderedItems.filter((i) => i.sizeInfo).map((i) => (
                          <div key={i.id} className="flex justify-between items-center">
                            <span>• Upgrade Size {i.sizeInfo} ({i.quantity} pcs)</span>
                            <span className="font-semibold text-primary">Rp {(i.price * i.quantity).toLocaleString('id-ID')}</span>
                          </div>
                        ))}
                      </div>
                      <p className="mt-2 text-[10px] text-muted-foreground leading-relaxed border-t border-primary/10 pt-1.5">
                        💡 Silakan siapkan popok lama si kecil, kurir kami akan menukar langsung dengan ukuran baru.
                      </p>
                    </div>
                  )}

                  <div className="mt-4 w-full rounded-2xl border border-line bg-page p-3.5 text-left text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Estimasi Pengiriman:</span>
                      <span className="font-bold text-ink">Besok, 09:00 WIB</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setIsCartOpen(false)
                      setActiveTab('home')
                    }}
                    className="mt-6 w-full rounded-2xl bg-primary py-3.5 text-xs font-bold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95"
                  >
                    Kembali ke Beranda
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </main>
  )
}
