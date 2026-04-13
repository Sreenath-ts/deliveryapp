'use client'
import React from 'react'
import { motion } from "motion/react"
import { ArrowRight, Check, CheckCircle, Package, Clock, MapPin, Sparkles, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

function OrderSuccess() {
    return (
        <div className='min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center px-4 py-12'>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='w-full max-w-md'
            >
                {/* Success Card */}
                <div className='bg-white rounded-3xl shadow-xl border border-green-100 overflow-hidden'>
                    {/* Header with Animation */}
                    <div className='bg-gradient-to-br from-green-600 to-green-700 p-8 text-center relative overflow-hidden'>
                        {/* Animated circles background */}
                        <motion.div
                            className='absolute top-0 left-0 w-full h-full'
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {[...Array(3)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className='absolute rounded-full border border-white/20'
                                    style={{
                                        width: 100 + i * 50,
                                        height: 100 + i * 50,
                                        left: '50%',
                                        top: '50%',
                                        marginLeft: -(50 + i * 25),
                                        marginTop: -(50 + i * 25),
                                    }}
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.3, 0.1, 0.3],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        delay: i * 0.5,
                                    }}
                                />
                            ))}
                        </motion.div>

                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                                type: "spring",
                                damping: 15,
                                stiffness: 200
                            }}
                            className='relative z-10'
                        >
                            <div className='w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg'>
                                <CheckCircle className='text-green-600 w-12 h-12' strokeWidth={2.5} />
                            </div>
                        </motion.div>
                        
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className='text-2xl font-bold text-white mt-4 relative z-10'
                        >
                            Order Placed!
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className='text-green-100 text-sm mt-1 relative z-10'
                        >
                            Thank you for shopping with us
                        </motion.p>
                    </div>

                    {/* Order Details */}
                    <div className='p-6 space-y-6'>
                        {/* Status Steps */}
                        <div className='flex items-center justify-between text-xs'>
                            <div className='flex flex-col items-center gap-2'>
                                <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center'>
                                    <Check size={18} className='text-green-600' />
                                </div>
                                <span className='text-gray-600 font-medium'>Ordered</span>
                            </div>
                            <div className='flex-1 h-0.5 bg-green-200 mx-2' />
                            <div className='flex flex-col items-center gap-2'>
                                <div className='w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center'>
                                    <Package size={18} className='text-gray-400' />
                                </div>
                                <span className='text-gray-400'>Packed</span>
                            </div>
                            <div className='flex-1 h-0.5 bg-gray-200 mx-2' />
                            <div className='flex flex-col items-center gap-2'>
                                <div className='w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center'>
                                    <MapPin size={18} className='text-gray-400' />
                                </div>
                                <span className='text-gray-400'>Delivered</span>
                            </div>
                        </div>

                        {/* Info Cards */}
                        <div className='grid grid-cols-2 gap-3'>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className='bg-orange-50 rounded-xl p-4 text-center border border-orange-100'
                            >
                                <Clock size={20} className='text-orange-500 mx-auto mb-1' />
                                <p className='text-xs text-gray-500'>Est. Delivery</p>
                                <p className='text-sm font-bold text-gray-800'>30-45 mins</p>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className='bg-blue-50 rounded-xl p-4 text-center border border-blue-100'
                            >
                                <Sparkles size={20} className='text-blue-500 mx-auto mb-1' />
                                <p className='text-xs text-gray-500'>Order Status</p>
                                <p className='text-sm font-bold text-gray-800'>Confirmed</p>
                            </motion.div>
                        </div>

                        {/* Message */}
                        <p className='text-center text-sm text-gray-500 leading-relaxed'>
                            You can track your order progress in the <span className="text-green-600 font-semibold">My Orders</span> section
                        </p>

                        {/* Buttons */}
                        <div className='space-y-3'>
                            <Link href="/user/my-orders">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className='w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-green-200 transition-all'
                                >
                                    <ShoppingBag size={18} />
                                    View My Orders
                                </motion.button>
                            </Link>
                            
                            <Link href="/">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className='w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl transition-all'
                                >
                                    Continue Shopping
                                    <ArrowRight size={18} />
                                </motion.button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Bottom Decoration */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className='flex justify-center mt-6 gap-2'
                >
                    <span className='w-2 h-2 bg-green-400 rounded-full animate-bounce' style={{ animationDelay: '0ms' }} />
                    <span className='w-2 h-2 bg-green-400 rounded-full animate-bounce' style={{ animationDelay: '150ms' }} />
                    <span className='w-2 h-2 bg-green-400 rounded-full animate-bounce' style={{ animationDelay: '300ms' }} />
                </motion.div>
            </motion.div>
        </div>
    )
}

export default OrderSuccess
