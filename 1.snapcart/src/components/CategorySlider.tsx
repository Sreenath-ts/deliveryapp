'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  Apple, Baby, Box, ChevronLeft, ChevronRight,
  Coffee, Cookie, Flame, Heart, Home, Milk, Sparkles,
  Wheat, ShoppingBag, Leaf, Beef, Star, Zap, Package,
  Candy, Droplets, Tag, X
} from 'lucide-react'
import { motion } from 'motion/react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { ICategory } from '@/models/category.model'

const iconComponentMap: Record<string, React.ElementType> = {
  Apple, Milk, Wheat, Cookie, Flame, Coffee,
  Heart, Home, Box, Baby, ShoppingBag, Leaf,
  Beef, Star, Zap, Package, Candy, Droplets, Tag
}

function getIcon(name: string): React.ElementType {
  return iconComponentMap[name] || Box
}

function CategorySlider({ selectedCategory }: { selectedCategory?: string | null }) {
  const [categories, setCategories] = useState<ICategory[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(true)
  const router = useRouter()

  useEffect(() => {
    axios.get('/api/categories')
      .then(res => setCategories(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

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
  }, [categories])

  useEffect(() => {
    if (loading || categories.length === 0) return
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
  }, [loading, categories])

  const handleCategoryClick = (catName: string) => {
    if (selectedCategory === catName) {
      router.push('/')
    } else {
      router.push(`/?category=${encodeURIComponent(catName)}`)
    }
  }

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
                  {selectedCategory ? 'Tap the same category to deselect.' : 'Tap a category to browse its products.'}
                </p>
                {selectedCategory && (
                  <button
                    onClick={() => router.push('/')}
                    className='mt-3 inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white pl-4 pr-3 py-2 rounded-full text-sm font-semibold shadow-md shadow-emerald-200 transition-all'
                  >
                    <X className='w-4 h-4' />
                    Clear: {selectedCategory}
                  </button>
                )}
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

              {loading ? (
                <div className='flex gap-4 overflow-hidden pb-2'>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className='min-w-[170px] sm:min-w-[190px] md:min-w-[210px] h-[148px] rounded-[28px] bg-slate-100 animate-pulse flex-shrink-0'
                    />
                  ))}
                </div>
              ) : (
                <div
                  ref={scrollRef}
                  className='flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scrollbar-hide sm:gap-5'
                >
                  {categories.map((cat, index) => {
                    const Icon = getIcon(cat.icon)
                    const isActive = selectedCategory === cat.name
                    const id = cat._id?.toString() || String(index)

                    return (
                      <motion.button
                        key={id}
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.04 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -8 }}
                        onClick={() => handleCategoryClick(cat.name)}
                        className='min-w-[170px] snap-start sm:min-w-[190px] md:min-w-[210px] text-left focus:outline-none'
                      >
                        <div className={`group relative overflow-hidden rounded-[28px] border p-5 shadow-sm transition-all duration-300 hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)] cursor-pointer ${
                          isActive
                            ? 'border-emerald-400 bg-emerald-50 ring-2 ring-emerald-300'
                            : 'border-slate-200 bg-white'
                        }`}>
                          <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} transition-opacity duration-300 ${isActive ? 'opacity-10' : 'opacity-0 group-hover:opacity-[0.10]'}`} />

                          <div className={`relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${cat.gradient} shadow-md sm:h-18 sm:w-18`}>
                            <Icon className='h-8 w-8 text-white sm:h-9 sm:w-9' />
                          </div>

                          <h3 className='relative text-sm font-bold leading-6 text-slate-900 sm:text-base'>
                            {cat.name}
                          </h3>

                          <div className='relative mt-4 flex items-center justify-between'>
                            <span className={`text-xs font-medium ${isActive ? 'text-emerald-600 font-semibold' : 'text-slate-500'}`}>
                              {isActive ? 'Active filter' : 'Explore'}
                            </span>
                            <div className={`h-2.5 w-2.5 rounded-full bg-gradient-to-br ${cat.gradient}`} />
                          </div>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default CategorySlider
