'use client'
import { Leaf, ShoppingBasket, Smartphone, Truck, Loader } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import React, { useEffect, useState } from 'react'
import { motion } from "motion/react"
import Image from 'next/image'
import axios from 'axios'

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

function HeroSection() {
    const [slides, setSlides] = useState<Slide[]>([])
    const [loading, setLoading] = useState(true)
    const [current, setCurrent] = useState(0)

    useEffect(() => {
        fetchBanners()
    }, [])

    const fetchBanners = async () => {
        try {
            const result = await axios.get("/api/banners/get-active")
            if (result.data && result.data.length > 0) {
                const transformedBanners = result.data.map((banner: Banner) => ({
                    id: banner._id,
                    title: banner.title,
                    subtitle: banner.subtitle,
                    buttonText: banner.buttonText,
                    bg: banner.image
                }))
                setSlides(transformedBanners)
            }
        } catch (error) {
            console.log("Failed to fetch banners", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (slides.length === 0) return
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length)
        }, 4000)
        return () => clearInterval(timer)
    }, [slides.length])

    if (loading) {
        return (
            <div className='relative w-[98%] mx-auto mt-32 h-[80vh] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center'>
                <Loader className='w-16 h-16 animate-spin text-green-600' />
            </div>
        )
    }

    if (slides.length === 0) {
        return (
            <div className='relative w-[98%] mx-auto mt-32 h-[40vh] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center'>
                <div className='text-center text-white px-6'>
                    <ShoppingBasket className='w-16 h-16 mx-auto mb-4' />
                    <h2 className='text-3xl font-bold mb-2'>Welcome to SnapCart</h2>
                    <p className='text-lg opacity-90'>Fresh groceries delivered to your door</p>
                </div>
            </div>
        )
    }

    return (
        <div className='relative w-[98%] mx-auto mt-32 h-[80vh] rounded-3xl overflow-hidden shadow-2xl'>
            <AnimatePresence mode='wait'>
                <motion.div
                    key={current}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    exit={{ opacity: 0 }}
                    className='absolute inset-0'
                >
                    <Image
                        src={slides[current]?.bg}
                        fill
                        alt='slide'
                        priority
                        className='object-cover'
                    />
                    <div className='absolute inset-0 bg-black/50 backdrop-blur-[1px]' />
                </motion.div>
            </AnimatePresence>

            <div className='absolute inset-0 flex items-center justify-center text-center text-white px-6'>
                <motion.div
                    key={`content-${current}`}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className='flex flex-col items-center justify-center gap-6 max-w-3xl'
                >
                    <h1 className='text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-lg'>
                        {slides[current].title}
                    </h1>
                    <p className='text-lg sm:text-xl text-gray-200 max-w-2xl'>
                        {slides[current].subtitle}
                    </p>
                    {/* <motion.button
                        whileHover={{ scale: 1.09 }}
                        whileTap={{ scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                        className='mt-4 bg-white text-green-700 hover:bg-green-100 px-8 py-3 rounded-full font-semibold shadow-lg transition-all duration-300 flex items-center gap-2'
                    >
                        <ShoppingBasket className='w-5 h-5' />
                        {slides[current].buttonText}
                    </motion.button> */}
                </motion.div>
            </div>

            <div className='absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3'>
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrent(index)}
                        className={`transition-all ${index === current ? "bg-white w-6 h-3" : "bg-white/50 w-3 h-3"
                            } rounded-full`}
                    />
                ))}
            </div>
        </div>
    )
}

export default HeroSection