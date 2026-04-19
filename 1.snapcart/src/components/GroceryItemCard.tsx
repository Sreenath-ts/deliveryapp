'use client'
import React from 'react'
import { motion } from "motion/react"
import Image from 'next/image'
import { Minus, Plus, ShoppingCart, Eye, Heart, Star, Zap } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from '@/redux/store'
import { addToCart, decreaseQuantity, increaseQuantity } from '@/redux/cartSlice'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'

interface IGrocery {
    _id: string,
    name: string,
    category: string,
    price: string,
    offerPrice?: string,
    unit: string,
    image: string,
    createdAt?: Date,
    updatedAt?: Date
}

function GroceryItemCard({ item }: { item: IGrocery }) {
    const dispatch = useDispatch<AppDispatch>()
    const router = useRouter()
    const { cartData } = useSelector((state: RootState) => state.cart)
    const cartItem = cartData.find(i => i._id.toString() == item._id)

    const discountPercent = item.offerPrice
        ? Math.round((parseFloat(item.price) - parseFloat(item.offerPrice)) / parseFloat(item.price) * 100)
        : 0

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true, amount: 0.2 }}
            whileHover={{ y: -8 }}
            className='bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col group relative'
        >
            {/* Wishlist Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className='absolute top-3 right-3 z-10 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 transition-all group/heart'
            >
                <Heart className='w-5 h-5 text-gray-400 group-hover/heart:text-red-500 transition-colors' />
            </motion.button>

            {/* Product Image */}
            <div
                onClick={() => router.push(`/user/product/${item._id}`)}
                className='relative w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden cursor-pointer'
            >
                {/* Discount Badge */}
                {item.offerPrice && (
                    <motion.div
                        initial={{ scale: 0, rotate: -12 }}
                        animate={{ scale: 1, rotate: -12 }}
                        className='absolute top-3 left-3 z-10'
                    >
                        <div className='bg-gradient-to-br from-red-500 to-rose-600 text-white px-3 py-1.5 rounded-2xl shadow-lg flex items-center gap-1'>
                            <Zap className='w-3 h-3' fill='currentColor' />
                            <span className='text-xs font-black'>{discountPercent}% OFF</span>
                        </div>
                    </motion.div>
                )}

                {/* Product Image */}
                <Image
                    src={item.image}
                    fill
                    alt={item.name}
                    sizes='(max-width: 768px) 50vw, 25vw'
                    className='object-contain p-4 transition-transform duration-500 group-hover:scale-110'
                />

                {/* Quick View Overlay */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-6'
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className='bg-white text-gray-900 px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-xl hover:bg-green-500 hover:text-white transition-all duration-300'
                    >
                        <Eye size={16} />
                        
                    </motion.button>
                </motion.div>
            </div>

            {/* Product Details */}
            <div className='p-4 flex flex-col flex-1'>
                {/* Category Badge */}
                <div className='flex items-center justify-between mb-2'>
                    <span className='text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full'>
                        {item.category}
                    </span>
                    <div className='flex items-center gap-1'>
                        <Star className='w-3 h-3 text-yellow-400 fill-yellow-400' />
                        <span className='text-xs font-bold text-gray-700'>4.5</span>
                    </div>
                </div>

                {/* Product Name */}
                <h3
                    onClick={() => router.push(`/user/product/${item._id}`)}
                    className='text-sm md:text-base font-bold text-gray-800 mb-2 line-clamp-2 cursor-pointer hover:text-green-600 transition-colors leading-snug'
                >
                    {item.name}
                </h3>

                {/* Unit */}
                <div className='mb-3'>
                    <span className='text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg'>
                        {item.unit}
                    </span>
                </div>

                {/* Price Section */}
                <div className='mb-4'>
                    {item.offerPrice ? (
                        <div className='flex items-end gap-2'>
                            <span className='text-2xl font-black text-green-600'>₹{item.offerPrice}</span>
                            <span className='text-sm text-gray-400 line-through mb-0.5'>₹{item.price}</span>
                        </div>
                    ) : (
                        <span className='text-2xl font-black text-green-600'>₹{item.price}</span>
                    )}
                </div>

                {/* Add to Cart Section */}
                {!cartItem ? (
                    <motion.button
                        className='w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl py-3 text-sm font-bold shadow-lg hover:shadow-xl transition-all'
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => dispatch(addToCart({ ...item, quantity: 1 }))}
                    >
                        <ShoppingCart className='w-4 h-4' />
                        Add to Cart
                    </motion.button>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className='w-full flex items-center justify-between bg-green-50 border-2 border-green-200 rounded-2xl py-2.5 px-4'
                    >
                        <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: '#dcfce7' }}
                            whileTap={{ scale: 0.9 }}
                            className='w-9 h-9 flex items-center justify-center rounded-xl bg-white shadow-md hover:shadow-lg transition-all'
                            onClick={() => dispatch(decreaseQuantity(item._id))}
                        >
                            <Minus size={16} className='text-green-700' strokeWidth={3} />
                        </motion.button>
                        
                        <span className='text-lg font-black text-gray-800 px-2'>{cartItem.quantity}</span>
                        
                        <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: '#dcfce7' }}
                            whileTap={{ scale: 0.9 }}
                            className='w-9 h-9 flex items-center justify-center rounded-xl bg-white shadow-md hover:shadow-lg transition-all'
                            onClick={() => dispatch(increaseQuantity(item._id))}
                        >
                            <Plus size={16} className='text-green-700' strokeWidth={3} />
                        </motion.button>
                    </motion.div>
                )}
            </div>

            {/* Shine Effect on Hover */}
            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none' />
        </motion.div>
    )
}

export default GroceryItemCard