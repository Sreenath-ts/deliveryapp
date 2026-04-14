'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  Apple,
  Baby,
  Box,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Cookie,
  Flame,
  Heart,
  Home,
  Milk,
  Sparkles,
  Wheat,
} from 'lucide-react'
import { motion } from 'motion/react'

function CategorySlider() {
  const categories = [
    { id: 1, name: 'Fruits & Vegetables', icon: Apple, gradient: 'from-green-400 to-emerald-500' },
    { id: 2, name: 'Dairy & Eggs', icon: Milk, gradient: 'from-yellow-400 to-orange-500' },
    { id: 3, name: 'Rice, Atta & Grains', icon: Wheat, gradient: 'from-amber-400 to-orange-600' },
    { id: 4, name: 'Snacks & Biscuits', icon: Cookie, gradient: 'from-pink-400 to-rose-500' },
    { id: 5, name: 'Spices & Masalas', icon: Flame, gradient: 'from-red-400 to-rose-600' },
    { id: 6, name: 'Beverages & Drinks', icon: Coffee, gradient: 'from-blue-400 to-cyan-500' },
    { id: 7, name: 'Personal Care', icon: Heart, gradient: 'from-purple-400 to-pink-500' },
    { id: 8, name: 'Household Essentials', icon: Home, gradient: 'from-lime-400 to-green-500' },
    { id: 9, name: 'Instant & Packaged Food', icon: Box, gradient: 'from-teal-400 to-cyan-500' },
    { id: 10, name: 'Baby & Pet Care', icon: Baby, gradient: 'from-rose-400 to-pink-500' },
  ]

  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(true)

  const checkScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setShowLeft(scrollLeft > 10)
    setShowRight(scrollLeft + clientWidth < scrollWidth - 10)
  }

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = direction === 'left' ? -320 : 320
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' })
  }

  useEffect(() => {
    const current = scrollRef.current
    if (!current) return

    current.addEventListener('scroll', checkScroll)
    window.addEventListener('resize', checkScroll)
    checkScroll()

    return () => {
      current.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (!scrollRef.current) return

      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' })
      }
    }, 3500)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className='w-full px-4 sm:px-6 lg:px-8 mt-14 md:mt-20'>
      <div className='mx-auto max-w-7xl'>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className='relative overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.06)]'
        >
          <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.10),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_30%)]' />

          <div className='relative px-5 py-6 sm:px-7 md:px-8 lg:px-10 lg:py-8'>
            <div className='mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between'>
              <div>
                <div className='mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2'>
                  <Sparkles className='h-4 w-4 text-emerald-600' />
                  <span className='text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700'>
                    Popular Categories
                  </span>
                </div>

                <h2 className='text-2xl font-black tracking-tight text-slate-900 sm:text-3xl md:text-4xl'>
                  Shop by category
                </h2>
                <p className='mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base'>
                  Browse the most important grocery sections with a cleaner, premium slider UI.
                </p>
              </div>

              <div className='hidden items-center gap-2 md:flex'>
                <button
                  onClick={() => scroll('left')}
                  disabled={!showLeft}
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition ${
                    showLeft
                      ? 'border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50'
                      : 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300'
                  }`}
                >
                  <ChevronLeft className='h-5 w-5' />
                </button>

                <button
                  onClick={() => scroll('right')}
                  disabled={!showRight}
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition ${
                    showRight
                      ? 'border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50'
                      : 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300'
                  }`}
                >
                  <ChevronRight className='h-5 w-5' />
                </button>
              </div>
            </div>

            <div className='relative'>
              {showLeft && (
                <button
                  onClick={() => scroll('left')}
                  className='absolute left-2 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg md:hidden'
                >
                  <ChevronLeft className='h-5 w-5' />
                </button>
              )}

              {showRight && (
                <button
                  onClick={() => scroll('right')}
                  className='absolute right-2 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg md:hidden'
                >
                  <ChevronRight className='h-5 w-5' />
                </button>
              )}

              <div
                ref={scrollRef}
                className='flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scrollbar-hide sm:gap-5'
              >
                {categories.map((cat, index) => {
                  const Icon = cat.icon

                  return (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.04 }}
                      viewport={{ once: true }}
                      whileHover={{ y: -8 }}
                      className='min-w-[170px] snap-start sm:min-w-[190px] md:min-w-[210px]'
                    >
                      <div className='group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)]'>
                        <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-[0.10]`} />

                        <div className={`relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${cat.gradient} shadow-md sm:h-18 sm:w-18`}>
                          <Icon className='h-8 w-8 text-white sm:h-9 sm:w-9' />
                        </div>

                        <h3 className='relative text-sm font-bold leading-6 text-slate-900 sm:text-base'>
                          {cat.name}
                        </h3>

                        <div className='relative mt-4 flex items-center justify-between'>
                          <span className='text-xs font-medium text-slate-500'>Explore</span>
                          <div className={`h-2.5 w-2.5 rounded-full bg-gradient-to-br ${cat.gradient}`} />
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default CategorySlider