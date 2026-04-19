'use client'

import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import {
  ArrowRight, BadgePercent, ChevronLeft, ChevronRight,
  Loader2, ShieldCheck, ShoppingBasket, Sparkles, Truck, Zap,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

interface BannerData {
  _id: string
  type: 'image' | 'text'
  title: string
  subtitle: string
  buttonText: string
  buttonLink?: string
  badge?: string
  image?: string
  bgGradient?: string
  textColor?: 'white' | 'dark'
  isActive: boolean
  order: number
}

interface Slide {
  id: string
  type: 'image' | 'text'
  title: string
  subtitle: string
  buttonText: string
  buttonLink?: string
  badge?: string
  imageUrl?: string
  bgGradient: string
  darkText: boolean
}

const FEATURES = [
  { icon: Truck, label: 'Fast Delivery' },
  { icon: BadgePercent, label: 'Daily Offers' },
  { icon: ShieldCheck, label: 'Trusted Quality' },
]

const AUTO_PLAY = 5000

function normalizeImage(src?: string): string {
  if (!src) return ''
  if (src.startsWith('http://') || src.startsWith('https://')) return src
  if (src.startsWith('/')) return src
  const base = process.env.NEXT_PUBLIC_IMAGE_BASE_URL?.replace(/\/$/, '')
  return base ? `${base}/${src.replace(/^\//, '')}` : `/${src.replace(/^\//, '')}`
}

function HeroSection({ targetId = 'products-section' }: { targetId?: string }) {
  const [slides, setSlides] = useState<Slide[]>([])
  const [loading, setLoading] = useState(true)
  const [current, setCurrent] = useState(0)
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({})
  const touchStartX = useRef<number | null>(null)

  const handleScroll = () => {
    const el = document.getElementById(targetId)
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 96, behavior: 'smooth' })
  }

  useEffect(() => {
    axios.get('/api/banners/get-active')
      .then(res => {
        if (res.data?.length > 0) {
          setSlides(res.data.map((b: BannerData): Slide => ({
            id: b._id,
            type: b.type || 'image',
            title: b.title,
            subtitle: b.subtitle,
            buttonText: b.buttonText || '',
            buttonLink: b.buttonLink || undefined,
            badge: b.badge || undefined,
            imageUrl: normalizeImage(b.image),
            bgGradient: b.bgGradient || 'from-slate-900 to-slate-800',
            darkText: b.textColor === 'dark',
          })))
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (slides.length <= 1) return
    const t = setInterval(() => setCurrent(p => (p + 1) % slides.length), AUTO_PLAY)
    return () => clearInterval(t)
  }, [slides.length])

  const prev = () => setCurrent(p => (p - 1 + slides.length) % slides.length)
  const next = () => setCurrent(p => (p + 1) % slides.length)
  const markFailed = (id: string) => setFailedImages(p => ({ ...p, [id]: true }))

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev()
    touchStartX.current = null
  }

  /* ─── Loading ─── */
  if (loading) {
    return (
      <section className='w-full'>
        <div className='relative w-full min-h-[480px] sm:min-h-[560px] lg:min-h-[640px] bg-slate-950 flex items-center justify-center'>
          <div className='absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(16,185,129,0.25),transparent_50%),radial-gradient(circle_at_70%_70%,rgba(59,130,246,0.15),transparent_45%)]' />
          <div className='relative text-center'>
            <Loader2 className='mx-auto mb-4 h-12 w-12 animate-spin text-emerald-400' />
            <p className='text-slate-400 font-medium'>Loading banners…</p>
          </div>
        </div>
      </section>
    )
  }

  /* ─── No banners — default fallback ─── */
  if (!slides.length) {
    return (
      <section className='w-full'>
        <div className='relative w-full min-h-[520px] sm:min-h-[620px] lg:min-h-[700px] overflow-hidden bg-slate-950'>
          <div className='absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(16,185,129,0.30),transparent_40%),radial-gradient(circle_at_80%_60%,rgba(59,130,246,0.18),transparent_35%),linear-gradient(135deg,#071120_0%,#0b1a2e_100%)]' />
          <div className='pointer-events-none absolute -left-24 top-8 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl' />
          <div className='pointer-events-none absolute -right-24 bottom-8 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl' />
          <div className='pointer-events-none absolute left-1/2 -top-8 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl' />

          <div className='relative flex min-h-[520px] sm:min-h-[620px] lg:min-h-[700px] items-center px-8 sm:px-14 lg:px-24 xl:px-32 py-16'>
            <div className='max-w-2xl'>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className='mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-5 py-2 backdrop-blur-xl'
              >
                <Sparkles className='h-4 w-4 text-emerald-300' />
                <span className='text-xs font-bold uppercase tracking-widest text-emerald-200'>Daily fresh picks</span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className='text-5xl font-black leading-[0.92] tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-8xl'
              >
                Fresh groceries,<br />
                <span className='bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent'>delivered fast</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className='mt-6 max-w-md text-base text-slate-300 sm:text-lg lg:text-xl leading-relaxed'
              >
                Farm-fresh produce, daily essentials, and your favourites — at your door in minutes.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className='mt-8 flex flex-wrap gap-3'
              >
                <button
                  onClick={handleScroll}
                  className='group inline-flex h-14 items-center gap-2.5 rounded-full bg-white px-8 text-sm font-bold text-slate-900 shadow-2xl shadow-white/20 transition-all hover:scale-105 hover:bg-slate-50 active:scale-95'
                >
                  <ShoppingBasket className='h-5 w-5' />
                  Start Shopping
                  <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
                </button>
                <button
                  onClick={handleScroll}
                  className='inline-flex h-14 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-7 text-sm font-semibold text-white backdrop-blur-xl transition-all hover:bg-white/15'
                >
                  View Deals
                </button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                className='mt-10 flex flex-wrap gap-2.5'
              >
                {FEATURES.map(({ icon: Icon, label }) => (
                  <div key={label} className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 backdrop-blur-xl'>
                    <Icon className='h-3.5 w-3.5 text-emerald-300' />
                    {label}
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const active = slides[current]
  const hasImage = active.type === 'image' && !failedImages[active.id] && active.imageUrl
  const tc = active.darkText ? 'text-slate-900' : 'text-white'
  const subtc = active.darkText ? 'text-slate-700' : 'text-slate-200'
  const chipBorder = active.darkText ? 'border-slate-300/60 bg-black/8 text-slate-800' : 'border-white/15 bg-white/10 text-white/85'
  const btnClass = active.darkText
    ? 'bg-slate-900 text-white shadow-black/25 hover:bg-slate-800'
    : 'bg-white text-slate-900 shadow-white/25 hover:bg-slate-50'

  return (
    <section
      className='w-full'
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className='relative w-full overflow-hidden bg-slate-950'>

        {/* ── Full-bleed background ── */}
        <AnimatePresence mode='wait'>
          <motion.div
            key={`bg-${active.id}`}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className='absolute inset-0'
          >
            {hasImage ? (
              <>
                <img
                  src={active.imageUrl}
                  alt={active.title}
                  className='h-full w-full object-cover'
                  onError={() => markFailed(active.id)}
                />
                {/* Left-heavy gradient so text stays readable */}
                <div className='absolute inset-0 bg-[linear-gradient(to_right,rgba(2,6,23,0.95)_0%,rgba(2,6,23,0.75)_38%,rgba(2,6,23,0.30)_65%,rgba(2,6,23,0.05)_100%)]' />
              </>
            ) : (
              <div className={`h-full w-full bg-gradient-to-br ${active.bgGradient}`} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Ambient glow */}
        <div className='pointer-events-none absolute -left-24 top-0 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-3xl' />
        <div className='pointer-events-none absolute right-0 bottom-0 h-80 w-80 rounded-full bg-cyan-400/6 blur-3xl' />

        {/* ── Content ── */}
        <div className='relative flex min-h-[480px] sm:min-h-[560px] lg:min-h-[680px] items-center px-8 sm:px-14 lg:px-24 xl:px-32 py-20'>
          <div className='max-w-2xl'>
            <AnimatePresence mode='wait'>
              <motion.div
                key={`content-${active.id}`}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.45 }}
              >
                {/* Badge */}
                {active.badge && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', bounce: 0.45 }}
                    className='mb-5 inline-flex items-center gap-2 rounded-full border border-yellow-400/50 bg-yellow-400/20 px-4 py-2 backdrop-blur-xl'
                  >
                    <motion.span
                      animate={{ scale: [1, 1.35, 1] }}
                      transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                    >
                      <Zap className='h-3.5 w-3.5 fill-yellow-300 text-yellow-300' />
                    </motion.span>
                    <span className='text-xs font-bold uppercase tracking-widest text-yellow-200'>{active.badge}</span>
                  </motion.div>
                )}

                {/* Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className={`text-[2.6rem] font-black leading-[0.92] tracking-tight sm:text-5xl md:text-[3.5rem] lg:text-[4rem] xl:text-[4.8rem] ${tc}`}
                >
                  {active.title}
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22 }}
                  className={`mt-5 max-w-md text-sm sm:text-base lg:text-lg leading-relaxed ${subtc}`}
                >
                  {active.subtitle}
                </motion.p>

                {/* CTA */}
                {active.buttonText && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className='mt-8'
                  >
                    {active.buttonLink ? (
                      <motion.a
                        whileHover={{ scale: 1.04, y: -2 }}
                        whileTap={{ scale: 0.96 }}
                        href={active.buttonLink}
                        target='_self'
                        className={`group inline-flex h-14 items-center gap-2.5 rounded-full px-9 text-sm font-bold shadow-2xl transition-all ${btnClass}`}
                      >
                        <ShoppingBasket className='h-5 w-5' />
                        {active.buttonText}
                        <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
                      </motion.a>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.04, y: -2 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={handleScroll}
                        className={`group inline-flex h-14 items-center gap-2.5 rounded-full px-9 text-sm font-bold shadow-2xl transition-all ${btnClass}`}
                      >
                        <ShoppingBasket className='h-5 w-5' />
                        {active.buttonText}
                        <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
                      </motion.button>
                    )}
                  </motion.div>
                )}

                {/* Feature chips */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.42 }}
                  className='mt-8 flex flex-wrap gap-2'
                >
                  {FEATURES.map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold backdrop-blur-xl ${chipBorder}`}
                    >
                      <Icon className='h-3.5 w-3.5' />
                      {label}
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── Prev / Next arrows ── */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prev}
              className='absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 h-11 w-11 flex items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60 active:scale-95'
              aria-label='Previous slide'
            >
              <ChevronLeft className='h-5 w-5' />
            </button>
            <button
              onClick={next}
              className='absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 h-11 w-11 flex items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60 active:scale-95'
              aria-label='Next slide'
            >
              <ChevronRight className='h-5 w-5' />
            </button>
          </>
        )}

        {/* ── Dots — bottom center ── */}
        {slides.length > 1 && (
          <div className='absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2'>
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`rounded-full transition-all duration-300 ${idx === current ? 'h-2 w-8 bg-white' : 'h-2 w-2 bg-white/35 hover:bg-white/65'}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* ── Progress bar ── */}
        {slides.length > 1 && (
          <motion.div
            key={current}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: AUTO_PLAY / 1000, ease: 'linear' }}
            className='absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400'
          />
        )}
      </div>
    </section>
  )
}

export default HeroSection
