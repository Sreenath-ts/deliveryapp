'use client'

import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import {
  ArrowRight,
  BadgePercent,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ShieldCheck,
  ShoppingBasket,
  Sparkles,
  Star,
  Truck,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'





interface HeroSectionProps {
  targetId?: string // optional, defaults to "products-section"
}

interface Banner {
  _id: string
  title: string
  subtitle: string
  buttonText: string
  image: string
  isActive: boolean
  order: number
}

interface Slide {
  id: string
  title: string
  subtitle: string
  buttonText: string
  bg: string
}

const AUTO_PLAY_DELAY = 5000
function HeroSection({ targetId = "products-section" }: HeroSectionProps) {

  const [slides, setSlides] = useState<Slide[]>([])
  const [loading, setLoading] = useState(true)
  const [current, setCurrent] = useState(0)
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({})

  const normalizeImage = (src?: string) => {
    if (!src) return ''

    if (src.startsWith('http://') || src.startsWith('https://')) return src
    if (src.startsWith('/')) return src

    const base = process.env.NEXT_PUBLIC_IMAGE_BASE_URL?.replace(/\/$/, '')
    return base ? `${base}/${src.replace(/^\//, '')}` : `/${src.replace(/^\//, '')}`
  }

    const handleScroll = () => {
    const productsSection = document.getElementById(targetId)
    if (productsSection) {
      const yOffset = -96 // adjust for navbar height
      const y = productsSection.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: "smooth" })
    }
  }

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const result = await axios.get('/api/banners/get-active')

      if (result?.data?.length > 0) {
        const transformed = result.data.map((banner: Banner) => ({
          id: banner._id,
          title: banner.title,
          subtitle: banner.subtitle,
          buttonText: banner.buttonText || 'Shop Now',
          bg: normalizeImage(banner.image),
        }))

        setSlides(transformed)
      }
    } catch (error) {
      console.error('Failed to fetch banners', error)
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    if (slides.length <= 1) return

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, AUTO_PLAY_DELAY)

    return () => clearInterval(timer)
  }, [slides.length])

  const nextSlide = () => {
    if (!slides.length) return
    setCurrent((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    if (!slides.length) return
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const markFailed = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }))
  }

  const activeSlide = slides[current]

  const orderedThumbs = useMemo(() => {
    if (!slides.length) return []
    return slides.map((_, index) => slides[(current + index) % slides.length]).slice(0, 4)
  }, [slides, current])

  if (loading) {
    return (
      <section className='w-full px-4 sm:px-6 lg:px-8 mt-8 md:mt-10'>
        <div className='relative mx-auto max-w-7xl min-h-[620px] overflow-hidden rounded-[34px] border border-white/10 bg-slate-950 shadow-[0_30px_100px_rgba(0,0,0,0.28)]'>
          <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.32),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.20),transparent_28%),linear-gradient(135deg,#07111f_0%,#0b1628_50%,#061018_100%)]' />
          <div className='relative flex min-h-[620px] items-center justify-center px-6 text-center'>
            <div>
              <Loader2 className='mx-auto mb-4 h-14 w-14 animate-spin text-emerald-400' />
              <h2 className='text-2xl font-semibold text-white sm:text-3xl'>
                Loading premium banner...
              </h2>
              <p className='mt-3 text-sm text-slate-300 sm:text-base'>
                Preparing a more polished shopping experience
              </p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!activeSlide) {
    return (
      <section className='w-full px-4 sm:px-6 lg:px-8 mt-8 md:mt-10'>
        <div className='relative mx-auto max-w-7xl min-h-[620px] overflow-hidden rounded-[34px] border border-white/10 bg-slate-950 shadow-[0_30px_100px_rgba(0,0,0,0.28)]'>
          <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.32),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.20),transparent_28%),linear-gradient(135deg,#07111f_0%,#0b1628_50%,#061018_100%)]' />
          <div className='relative flex min-h-[620px] items-center px-6 sm:px-8 lg:px-14'>
            <div className='max-w-2xl'>
              <div className='mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-xl'>
                <Sparkles className='h-4 w-4 text-emerald-300' />
                <span className='text-xs font-semibold uppercase tracking-[0.22em] text-white/90'>
                  Beautiful grocery experience
                </span>
              </div>

              <h1 className='text-4xl font-black leading-[1.02] text-white sm:text-5xl lg:text-6xl'>
                Fresh groceries with
                <span className='block bg-gradient-to-r from-emerald-300 via-green-300 to-lime-200 bg-clip-text text-transparent'>
                  a luxury storefront feel
                </span>
              </h1>

              <p className='mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg'>
                A modern hero layout with cinematic visuals, stronger depth, and cleaner calls to action.
              </p>

              <div className='mt-8 flex flex-col gap-4 sm:flex-row'>
                <button className='inline-flex h-14 items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-slate-900 shadow-xl'>
                  <ShoppingBasket className='h-5 w-5' />
                  Start Shopping
                  <ArrowRight className='h-4 w-4' />
                </button>
                <button className='inline-flex h-14 items-center justify-center rounded-full border border-white/15 bg-white/10 px-7 text-sm font-semibold text-white backdrop-blur-xl'>
                  Explore Offers
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className='w-full px-4 sm:px-6 lg:px-8 mt-8 md:mt-10'>
      <div className='relative mx-auto max-w-7xl overflow-hidden rounded-[34px] border border-white/10 bg-slate-950 shadow-[0_35px_120px_rgba(0,0,0,0.30)]'>
        <AnimatePresence mode='wait'>
          <motion.div
            key={`bg-${activeSlide.id}`}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.8 }}
            className='absolute inset-0'
          >
            {!failedImages[activeSlide.id] && activeSlide.bg ? (
              <img
                src={activeSlide.bg}
                alt={activeSlide.title}
                className='h-full w-full object-cover'
                onError={() => markFailed(activeSlide.id)}
              />
            ) : (
              <div className='h-full w-full bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.35),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.22),transparent_25%),linear-gradient(135deg,#07111f_0%,#0b1628_50%,#061018_100%)]' />
            )}

            <div className='absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.88)_0%,rgba(2,6,23,0.72)_35%,rgba(2,6,23,0.36)_65%,rgba(2,6,23,0.20)_100%)]' />
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_25%)]' />
          </motion.div>
        </AnimatePresence>

        <div className='pointer-events-none absolute -left-8 top-12 h-56 w-56 rounded-full bg-emerald-400/15 blur-3xl' />
        <div className='pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl' />
        <div className='pointer-events-none absolute bottom-0 right-1/4 h-44 w-44 rounded-full bg-lime-300/10 blur-3xl' />

        <div className='relative min-h-[640px] lg:min-h-[720px]'>
          <div className='flex min-h-[640px] flex-col justify-between lg:min-h-[720px]'>
            <div className='flex items-start justify-between px-5 pt-5 sm:px-7 md:px-10 lg:px-14 lg:pt-8'>
              <div className='inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-xl'>
                <Sparkles className='h-4 w-4 text-emerald-300' />
                <span className='text-[11px] font-semibold uppercase tracking-[0.22em] text-white/90 sm:text-xs'>
                  Premium daily picks
                </span>
              </div>

              <div className='hidden rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-right backdrop-blur-xl md:block'>
                <p className='text-[10px] uppercase tracking-[0.24em] text-white/60'>Current slide</p>
                <p className='mt-1 text-sm font-semibold text-white'>
                  {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
                </p>
              </div>
            </div>

            <div className='grid flex-1 grid-cols-1 gap-8 px-5 pb-6 pt-6 sm:px-7 md:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-14 lg:pb-10 lg:pt-8'>
              <div className='flex items-center'>
                <AnimatePresence mode='wait'>
                  <motion.div
                    key={`content-${activeSlide.id}`}
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -18 }}
                    transition={{ duration: 0.55 }}
                    className='max-w-2xl'
                  >
                    <div className='mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-4 py-2 backdrop-blur-xl'>
                      <Star className='h-4 w-4 text-yellow-300' />
                      <span className='text-xs font-semibold text-white'>
                        Best choice for fast grocery shopping
                      </span>
                    </div>

                    <h1 className='text-[2.45rem] font-black leading-[0.94] tracking-[-0.04em] text-white sm:text-5xl md:text-6xl lg:text-7xl'>
                      {activeSlide.title}
                    </h1>

                    <p className='mt-6 max-w-xl text-sm leading-7 text-slate-200 sm:text-base md:text-lg'>
                      {activeSlide.subtitle}
                    </p>

                    <div className='mt-8 flex flex-col gap-4 sm:flex-row sm:items-center'>
<motion.button
    whileHover={{ scale: 1.02, y: -1 }}
    whileTap={{ scale: 0.98 }}
    onClick={handleScroll}
    className="group inline-flex h-14 items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-slate-900 shadow-[0_14px_35px_rgba(255,255,255,0.16)] transition"
  >
    <ShoppingBasket className="h-5 w-5" />
    {activeSlide.buttonText}
    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
  </motion.button>

                      {/* <button className='inline-flex h-14 items-center justify-center rounded-full border border-white/15 bg-white/10 px-7 text-sm font-semibold text-white backdrop-blur-xl transition hover:bg-white/15'>
                        View today’s deals
                      </button> */}
                    </div>

                    <div className='mt-8 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3'>
                      <div className='rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl'>
                        <Truck className='mb-3 h-5 w-5 text-emerald-300' />
                        <p className='text-sm font-semibold text-white'>Fast Delivery</p>
                        <p className='mt-1 text-xs text-slate-300'>Quick, reliable doorstep service</p>
                      </div>

                      <div className='rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl'>
                        <BadgePercent className='mb-3 h-5 w-5 text-emerald-300' />
                        <p className='text-sm font-semibold text-white'>Daily Offers</p>
                        <p className='mt-1 text-xs text-slate-300'>Fresh discounts across top picks</p>
                      </div>

                      <div className='rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl'>
                        <ShieldCheck className='mb-3 h-5 w-5 text-emerald-300' />
                        <p className='text-sm font-semibold text-white'>Trusted Quality</p>
                        <p className='mt-1 text-xs text-slate-300'>Carefully selected essentials</p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className='flex items-end justify-end'>
                <div className='w-full max-w-[460px]'>
                  <motion.div
                    initial={{ opacity: 0, y: 26 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.1 }}
                    className='rounded-[30px] border border-white/10 bg-white/10 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:p-5'
                  >
                    <div className='flex items-start justify-between gap-4'>
                      <div>
                        <p className='text-[10px] uppercase tracking-[0.24em] text-white/65'>
                          Featured collection
                        </p>
                        <h3 className='mt-2 text-xl font-bold text-white sm:text-2xl'>
                          Freshly curated picks
                        </h3>
                      </div>

                      <div className='rounded-full bg-emerald-400/15 px-3 py-2 text-xs font-semibold text-emerald-200'>
                        Up to 50% off
                      </div>
                    </div>

                    <div className='mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4 backdrop-blur-xl'>
                      <p className='text-sm font-semibold text-white'>{activeSlide.title}</p>
                      <p className='mt-2 text-sm leading-6 text-slate-300'>{activeSlide.subtitle}</p>

                      <div className='mt-4 flex flex-wrap gap-2'>
                        <span className='rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white/90'>
                          Same day delivery
                        </span>
                        <span className='rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white/90'>
                          Fresh stock
                        </span>
                        <span className='rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white/90'>
                          Secure checkout
                        </span>
                      </div>
                    </div>

                    <div className='mt-5 grid grid-cols-1 gap-3'>
                      {orderedThumbs.map((slide, index) => {
                        const realIndex = slides.findIndex((s) => s.id === slide.id)
                        const isActive = slide.id === activeSlide.id

                        return (
                          <button
                            key={slide.id}
                            onClick={() => setCurrent(realIndex)}
                            className={`group flex items-center gap-3 rounded-[22px] border p-3 text-left transition ${
                              isActive
                                ? 'border-white/20 bg-white/16'
                                : 'border-white/10 bg-white/8 hover:bg-white/12'
                            }`}
                          >
                            <div className='relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-900'>
                              {!failedImages[slide.id] && slide.bg ? (
                                <img
                                  src={slide.bg}
                                  alt={slide.title}
                                  className='h-full w-full object-cover'
                                  onError={() => markFailed(slide.id)}
                                />
                              ) : (
                                <div className='flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-500/25 to-slate-950'>
                                  <ShoppingBasket className='h-5 w-5 text-emerald-300' />
                                </div>
                              )}
                            </div>

                            <div className='min-w-0 flex-1'>
                              <p className='text-[10px] uppercase tracking-[0.18em] text-white/55'>
                                {String(realIndex + 1).padStart(2, '0')}
                              </p>
                              <p className='mt-1 truncate text-sm font-semibold text-white'>
                                {slide.title}
                              </p>
                              <p className='mt-1 text-xs text-slate-300'>
                                {isActive ? 'Currently showing' : index === 1 ? 'Up next' : 'Explore this banner'}
                              </p>
                            </div>

                            <ArrowRight
                              className={`h-4 w-4 flex-shrink-0 transition ${
                                isActive ? 'text-white' : 'text-white/50 group-hover:text-white/90'
                              }`}
                            />
                          </button>
                        )
                      })}
                    </div>

                    <div className='mt-5 flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        {slides.map((slide, index) => (
                          <button
                            key={slide.id}
                            onClick={() => setCurrent(index)}
                            className={`rounded-full transition-all ${
                              index === current ? 'h-2.5 w-8 bg-white' : 'h-2.5 w-2.5 bg-white/35 hover:bg-white/60'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                          />
                        ))}
                      </div>

                      <div className='flex items-center gap-2'>
                        <button
                          onClick={prevSlide}
                          className='inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white backdrop-blur-xl transition hover:bg-white/15'
                          aria-label='Previous slide'
                        >
                          <ChevronLeft className='h-5 w-5' />
                        </button>
                        <button
                          onClick={nextSlide}
                          className='inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white backdrop-blur-xl transition hover:bg-white/15'
                          aria-label='Next slide'
                        >
                          <ChevronRight className='h-5 w-5' />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {slides.length > 1 && (
          <motion.div
            key={current}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: AUTO_PLAY_DELAY / 1000, ease: 'linear' }}
            className='absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-emerald-300 via-white to-cyan-300'
          />
        )}
      </div>
    </section>
  )
}

export default HeroSection