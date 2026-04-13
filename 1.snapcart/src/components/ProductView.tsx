// 'use client'

// import React, { useState } from 'react'
// import { motion, AnimatePresence } from 'motion/react'
// import Image from 'next/image'
// import { useDispatch, useSelector } from 'react-redux'
// import { ArrowLeft, Minus, Plus, ShoppingCart, Truck, Shield, RotateCcw, Star, Package, Heart, Share2, Check, Sparkles } from 'lucide-react'
// import { useRouter } from 'next/navigation'
// import { AppDispatch, RootState } from '@/redux/store'
// import { addToCart, decreaseQuantity, increaseQuantity } from '@/redux/cartSlice'
// import Nav from './Nav'
// import Footer from './Footer'

// interface IGrocery {
//     _id: string
//     name: string
//     category: string
//     price: string
//     offerPrice?: string
//     unit: string
//     image: string
//     createdAt?: Date
//     updatedAt?: Date
// }

// interface ProductViewProps {
//     product: IGrocery
//     user: any
// }

// function ProductView({ product, user }: ProductViewProps) {
//     const router = useRouter()
//     const dispatch = useDispatch<AppDispatch>()
//     const { cartData } = useSelector((state: RootState) => state.cart)
//     const cartItem = cartData.find(i => i._id.toString() === product._id)
//     const [isWishlisted, setIsWishlisted] = useState(false)
//     const [showAddedToast, setShowAddedToast] = useState(false)

//     const discountPercentage = product.offerPrice
//         ? Math.round((parseFloat(product.price) - parseFloat(product.offerPrice)) / parseFloat(product.price) * 100)
//         : 0

//     const currentPrice = product.offerPrice || product.price
//     const originalPrice = product.price

//     const handleAddToCart = () => {
//         dispatch(addToCart({ ...product, quantity: 1 }))
//         setShowAddedToast(true)
//         setTimeout(() => setShowAddedToast(false), 2000)
//     }

//     return (
//         <>
//             <Nav user={user} />
//             <div className="min-h-screen bg-gray-50 pt-16 pb-12">
//                 {/* Added to Cart Toast */}
//                 <AnimatePresence>
//                     {showAddedToast && (
//                         <motion.div
//                             initial={{ opacity: 0, y: -50, scale: 0.9 }}
//                             animate={{ opacity: 1, y: 0, scale: 1 }}
//                             exit={{ opacity: 0, y: -20, scale: 0.9 }}
//                             className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 font-semibold"
//                         >
//                             <Check size={18} className="bg-white text-green-600 rounded-full p-0.5" />
//                             Added to cart!
//                         </motion.div>
//                     )}
//                 </AnimatePresence>

//                 <div className="max-w-5xl mx-auto px-4">
//                     {/* Breadcrumb */}
//                     <motion.div
//                         initial={{ opacity: 0, y: -10 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         className="flex items-center gap-2 text-sm text-gray-500 mb-4"
//                     >
//                         <button
//                             onClick={() => router.push('/')}
//                             className="flex items-center gap-1 hover:text-green-600 transition-colors"
//                         >
//                             <ArrowLeft size={14} />
//                             Home
//                         </button>
//                         <span className="text-gray-300">/</span>
//                         <span className="text-gray-400">{product.category}</span>
//                         <span className="text-gray-300">/</span>
//                         <span className="text-gray-800 font-medium truncate max-w-[150px]">{product.name}</span>
//                     </motion.div>

//                     <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//                         <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
//                             {/* Product Image - Compact */}
//                             <motion.div
//                                 initial={{ opacity: 0 }}
//                                 animate={{ opacity: 1 }}
//                                 className="md:col-span-5 bg-gray-50 relative"
//                             >
//                                 <div className="relative aspect-[4/3] md:aspect-auto md:h-full min-h-[280px] max-h-[400px] p-6">
//                                     {discountPercentage > 0 && (
//                                         <div className="absolute top-3 left-3 z-10">
//                                             <span className="bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
//                                                 <Sparkles size={10} />
//                                                 {discountPercentage}% OFF
//                                             </span>
//                                         </div>
//                                     )}
//                                     <button
//                                         onClick={() => setIsWishlisted(!isWishlisted)}
//                                         className="absolute top-3 right-3 z-10 w-9 h-9 bg-white/90 backdrop-blur rounded-full shadow-sm flex items-center justify-center hover:bg-white transition-all active:scale-95"
//                                     >
//                                         <Heart
//                                             size={18}
//                                             className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'}
//                                         />
//                                     </button>
//                                     <Image
//                                         src={product.image}
//                                         alt={product.name}
//                                         fill
//                                         className="object-contain p-4"
//                                         sizes="(max-width: 768px) 100vw, 40vw"
//                                         priority
//                                     />
//                                 </div>
//                             </motion.div>

//                             {/* Product Details - Compact */}
//                             <motion.div
//                                 initial={{ opacity: 0, x: 10 }}
//                                 animate={{ opacity: 1, x: 0 }}
//                                 transition={{ delay: 0.1 }}
//                                 className="md:col-span-7 p-5 md:p-6"
//                             >
//                                 {/* Header */}
//                                 <div className="flex items-start justify-between gap-3 mb-3">
//                                     <div className="flex-1">
//                                         <div className="flex items-center gap-2 mb-2">
//                                             <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
//                                                 {product.category}
//                                             </span>
//                                             <div className="flex items-center gap-0.5">
//                                                 <Star size={10} fill="#fbbf24" className="text-yellow-400" />
//                                                 <span className="text-xs text-gray-500">4.8</span>
//                                             </div>
//                                         </div>
//                                         <h1 className="text-xl md:text-2xl font-bold text-gray-800 leading-snug">
//                                             {product.name}
//                                         </h1>
//                                     </div>
//                                     <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap">
//                                         {product.unit}
//                                     </span>
//                                 </div>

//                                 {/* Pricing - Compact */}
//                                 <div className="flex items-baseline gap-3 mb-4">
//                                     <span className="text-3xl font-bold text-green-700">
//                                         ₹{currentPrice}
//                                     </span>
//                                     {product.offerPrice && (
//                                         <>
//                                             <span className="text-base text-gray-400 line-through">
//                                                 ₹{originalPrice}
//                                             </span>
//                                             <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
//                                                 Save ₹{Math.round(parseFloat(originalPrice) - parseFloat(currentPrice))}
//                                             </span>
//                                         </>
//                                     )}
//                                 </div>

//                                 {/* Trust Badges - Horizontal Compact */}
//                                 <div className="flex items-center gap-4 py-3 border-y border-gray-100 mb-4">
//                                     <div className="flex items-center gap-1.5">
//                                         <Truck size={14} className="text-green-600" />
//                                         <span className="text-xs text-gray-600">Free Delivery</span>
//                                     </div>
//                                     <div className="w-px h-4 bg-gray-200"></div>
//                                     <div className="flex items-center gap-1.5">
//                                         <Shield size={14} className="text-green-600" />
//                                         <span className="text-xs text-gray-600">Quality</span>
//                                     </div>
//                                     <div className="w-px h-4 bg-gray-200"></div>
//                                     <div className="flex items-center gap-1.5">
//                                         <RotateCcw size={14} className="text-green-600" />
//                                         <span className="text-xs text-gray-600">Easy Returns</span>
//                                     </div>
//                                 </div>

//                                 {/* Add to Cart - Professional */}
//                                 <div className="space-y-3">
//                                     {!cartItem ? (
//                                         <div className="flex gap-3">
//                                             <motion.button
//                                                 whileTap={{ scale: 0.98 }}
//                                                 onClick={handleAddToCart}
//                                                 className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl py-3 text-sm font-semibold transition-all shadow-md hover:shadow-lg"
//                                             >
//                                                 <ShoppingCart size={18} />
//                                                 Add to Cart
//                                             </motion.button>
//                                             <motion.button
//                                                 whileTap={{ scale: 0.98 }}
//                                                 onClick={() => {
//                                                     handleAddToCart()
//                                                     router.push('/user/cart')
//                                                 }}
//                                                 className="px-5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-all"
//                                             >
//                                                 Buy Now
//                                             </motion.button>
//                                         </div>
//                                     ) : (
//                                         <div className="space-y-3">
//                                             <motion.div
//                                                 initial={{ opacity: 0, scale: 0.95 }}
//                                                 animate={{ opacity: 1, scale: 1 }}
//                                                 className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-3"
//                                             >
//                                                 <span className="text-sm font-semibold text-green-800 flex items-center gap-2">
//                                                     <Check size={16} className="bg-green-600 text-white rounded-full p-0.5" />
//                                                     Added to cart
//                                                 </span>
//                                                 <div className="flex items-center gap-3">
//                                                     <button
//                                                         className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 hover:border-green-400 transition-all"
//                                                         onClick={() => dispatch(decreaseQuantity(product._id))}
//                                                     >
//                                                         <Minus size={14} className="text-gray-600" />
//                                                     </button>
//                                                     <span className="text-base font-bold text-gray-800 w-6 text-center">
//                                                         {cartItem.quantity}
//                                                     </span>
//                                                     <button
//                                                         className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-600 hover:bg-green-700 transition-all"
//                                                         onClick={() => dispatch(increaseQuantity(product._id))}
//                                                     >
//                                                         <Plus size={14} className="text-white" />
//                                                     </button>
//                                                 </div>
//                                             </motion.div>
//                                             <button
//                                                 onClick={() => router.push('/user/cart')}
//                                                 className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2"
//                                             >
//                                                 View Cart <ArrowLeft size={14} className="rotate-180" />
//                                             </button>
//                                         </div>
//                                     )}
//                                 </div>

//                                 {/* Share */}
//                                 <button
//                                     onClick={() => {
//                                         if (navigator.share) {
//                                             navigator.share({
//                                                 title: product.name,
//                                                 text: `Check out ${product.name} on SnapCart!`,
//                                                 url: window.location.href,
//                                             })
//                                         }
//                                     }}
//                                     className="mt-4 flex items-center gap-2 text-gray-400 hover:text-green-600 transition-colors text-xs"
//                                 >
//                                     <Share2 size={14} />
//                                     <span className="font-medium">Share product</span>
//                                 </button>
//                             </motion.div>
//                         </div>

//                         {/* Info Cards - Compact Bottom Section */}
//                         <div className="grid grid-cols-2 border-t border-gray-100">
//                             <div className="p-4 border-r border-gray-100">
//                                 <div className="flex items-center gap-2 mb-2">
//                                     <Package size={16} className="text-green-600" />
//                                     <h3 className="text-sm font-bold text-gray-800">Details</h3>
//                                 </div>
//                                 <div className="space-y-1.5 text-xs text-gray-500">
//                                     <div className="flex justify-between">
//                                         <span>Category</span>
//                                         <span className="text-gray-700">{product.category}</span>
//                                     </div>
//                                     <div className="flex justify-between">
//                                         <span>Unit</span>
//                                         <span className="text-gray-700">{product.unit}</span>
//                                     </div>
//                                 </div>
//                             </div>
//                             <div className="p-4">
//                                 <div className="flex items-center gap-2 mb-2">
//                                     <Truck size={16} className="text-blue-600" />
//                                     <h3 className="text-sm font-bold text-gray-800">Delivery</h3>
//                                 </div>
//                                 <ul className="space-y-1 text-xs text-gray-500">
//                                     <li className="flex items-center gap-1.5">
//                                         <span className="text-green-500">✓</span>
//                                         Free above ₹199
//                                     </li>
//                                     <li className="flex items-center gap-1.5">
//                                         <span className="text-green-500">✓</span>
//                                         Same day delivery
//                                     </li>
//                                 </ul>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//             <Footer />
//         </>
//     )
// }

// export default ProductView
'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Image from 'next/image'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowLeft, Minus, Plus, ShoppingCart, Truck, Shield, RotateCcw, Star, Package, Heart, Share2, Check, Sparkles, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { AppDispatch, RootState } from '@/redux/store'
import { addToCart, decreaseQuantity, increaseQuantity } from '@/redux/cartSlice'
import Nav from './Nav'
import Footer from './Footer'

interface IGrocery {
    _id: string
    name: string
    category: string
    price: string
    offerPrice?: string
    unit: string
    image: string
    createdAt?: Date
    updatedAt?: Date
}

interface ProductViewProps {
    product: IGrocery
    user: any
}

function ProductView({ product, user }: ProductViewProps) {
    const router = useRouter()
    const dispatch = useDispatch<AppDispatch>()
    const { cartData } = useSelector((state: RootState) => state.cart)
    const cartItem = cartData.find(i => i._id.toString() === product._id)
    const [isWishlisted, setIsWishlisted] = useState(false)
    const [showAddedToast, setShowAddedToast] = useState(false)

    const discountPercentage = product.offerPrice
        ? Math.round((parseFloat(product.price) - parseFloat(product.offerPrice)) / parseFloat(product.price) * 100)
        : 0

    const currentPrice = product.offerPrice || product.price
    const originalPrice = product.price

    const handleAddToCart = () => {
        dispatch(addToCart({ ...product, quantity: 1 }))
        setShowAddedToast(true)
        setTimeout(() => setShowAddedToast(false), 2000)
    }

    return (
        <>
            <Nav user={user} />
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20 pb-16">
                {/* Added to Cart Toast */}
                <AnimatePresence>
                    {showAddedToast && (
                        <motion.div
                            initial={{ opacity: 0, y: -50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.9 }}
                            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-semibold"
                        >
                            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                                <Check size={16} className="text-green-600" />
                            </div>
                            Added to cart successfully!
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-sm mb-6"
                    >
                        <button
                            onClick={() => router.push('/user')}
                            className="flex items-center gap-1.5 text-gray-500 hover:text-green-600 transition-colors font-medium"
                        >
                            <ArrowLeft size={16} />
                            Back to Products
                        </button>
                        <ChevronRight size={14} className="text-gray-300" />
                        <span className="text-gray-400">{product.category}</span>
                        <ChevronRight size={14} className="text-gray-300" />
                        <span className="text-gray-800 font-semibold truncate max-w-[200px]">{product.name}</span>
                    </motion.div>

                    {/* Main Product Card */}
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                            {/* Product Image Section */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="relative bg-gradient-to-br from-gray-50 to-white p-8 lg:p-12"
                            >
                                <div className="relative aspect-square max-w-lg mx-auto">
                                    {/* Discount Badge */}
                                    {discountPercentage > 0 && (
                                        <motion.div
                                            initial={{ scale: 0, rotate: -15 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ type: "spring", delay: 0.2 }}
                                            className="absolute top-0 left-0 z-10"
                                        >
                                            <div className="bg-gradient-to-br from-red-500 to-rose-600 text-white px-4 py-2 rounded-2xl shadow-lg">
                                                <div className="flex items-center gap-1.5">
                                                    <Sparkles size={14} className="animate-pulse" />
                                                    <span className="font-bold text-sm">{discountPercentage}% OFF</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Wishlist Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setIsWishlisted(!isWishlisted)}
                                        className="absolute top-0 right-0 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all"
                                    >
                                        <Heart
                                            size={20}
                                            className={`transition-all ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                                        />
                                    </motion.button>

                                    {/* Product Image */}
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.1 }}
                                        className="relative w-full h-full"
                                    >
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            fill
                                            className="object-contain drop-shadow-2xl"
                                            sizes="(max-width: 1024px) 100vw, 50vw"
                                            priority
                                        />
                                    </motion.div>
                                </div>
                            </motion.div>

                            {/* Product Details Section */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="p-8 lg:p-12 flex flex-col justify-center"
                            >
                                {/* Category & Rating */}
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-full uppercase tracking-wider border border-green-200">
                                        {product.category}
                                    </span>
                                    <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-200">
                                        <Star size={14} fill="#fbbf24" className="text-yellow-400" />
                                        <span className="text-sm font-semibold text-gray-700">4.8</span>
                                        <span className="text-xs text-gray-500">(124)</span>
                                    </div>
                                </div>

                                {/* Product Name */}
                                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2 leading-tight">
                                    {product.name}
                                </h1>

                                {/* Unit Badge */}
                                <div className="inline-flex items-center gap-2 mb-6">
                                    <Package size={16} className="text-gray-400" />
                                    <span className="text-sm font-medium text-gray-600">
                                        Pack Size: <span className="text-gray-900 font-semibold">{product.unit}</span>
                                    </span>
                                </div>

                                {/* Pricing */}
                                <div className="mb-8">
                                    <div className="flex items-baseline gap-4 mb-2">
                                        <span className="text-5xl font-bold text-green-600">
                                            ₹{currentPrice}
                                        </span>
                                        {product.offerPrice && (
                                            <span className="text-2xl text-gray-400 line-through">
                                                ₹{originalPrice}
                                            </span>
                                        )}
                                    </div>
                                    {product.offerPrice && (
                                        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl border border-green-200">
                                            <Sparkles size={14} />
                                            <span className="font-semibold text-sm">
                                                You save ₹{Math.round(parseFloat(originalPrice) - parseFloat(currentPrice))}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Trust Badges */}
                                <div className="grid grid-cols-3 gap-4 mb-8">
                                    <div className="flex flex-col items-center text-center p-4 bg-green-50 rounded-2xl border border-green-100">
                                        <Truck size={24} className="text-green-600 mb-2" />
                                        <span className="text-xs font-semibold text-gray-700">Free Delivery</span>
                                    </div>
                                    <div className="flex flex-col items-center text-center p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                        <Shield size={24} className="text-blue-600 mb-2" />
                                        <span className="text-xs font-semibold text-gray-700">Quality</span>
                                    </div>
                                    <div className="flex flex-col items-center text-center p-4 bg-purple-50 rounded-2xl border border-purple-100">
                                        <RotateCcw size={24} className="text-purple-600 mb-2" />
                                        <span className="text-xs font-semibold text-gray-700">Easy Returns</span>
                                    </div>
                                </div>

                                {/* Add to Cart Section */}
                                {!cartItem ? (
                                    <div className="space-y-3">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleAddToCart}
                                            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-2xl py-4 text-base font-bold transition-all shadow-lg hover:shadow-xl"
                                        >
                                            <ShoppingCart size={22} />
                                            Add to Cart
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                handleAddToCart()
                                                router.push('/user/cart')
                                            }}
                                            className="w-full bg-gray-900 hover:bg-black text-white rounded-2xl py-4 text-base font-bold transition-all shadow-lg hover:shadow-xl"
                                        >
                                            Buy Now
                                        </motion.button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-5"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2 text-green-700">
                                                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                                                        <Check size={16} className="text-white" />
                                                    </div>
                                                    <span className="font-bold text-sm">Added to cart</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-center gap-4 bg-white rounded-xl p-3 shadow-sm">
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-all"
                                                    onClick={() => dispatch(decreaseQuantity(product._id))}
                                                >
                                                    <Minus size={18} className="text-gray-700" />
                                                </motion.button>
                                                <span className="text-xl font-bold text-gray-900 min-w-[40px] text-center">
                                                    {cartItem.quantity}
                                                </span>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-green-600 hover:bg-green-700 transition-all"
                                                    onClick={() => dispatch(increaseQuantity(product._id))}
                                                >
                                                    <Plus size={18} className="text-white" />
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => router.push('/user/cart')}
                                            className="w-full bg-gray-900 hover:bg-black text-white rounded-2xl py-4 text-base font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
                                        >
                                            View Cart
                                            <ArrowLeft size={18} className="rotate-180" />
                                        </motion.button>
                                    </div>
                                )}

                                {/* Share Button */}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        if (navigator.share) {
                                            navigator.share({
                                                title: product.name,
                                                text: `Check out ${product.name} on SnapCart!`,
                                                url: window.location.href,
                                            })
                                        }
                                    }}
                                    className="mt-6 flex items-center justify-center gap-2 text-gray-500 hover:text-green-600 transition-colors text-sm font-medium"
                                >
                                    <Share2 size={16} />
                                    Share product
                                </motion.button>
                            </motion.div>
                        </div>

                        {/* Bottom Info Section */}
                        <div className="border-t border-gray-100 bg-gradient-to-b from-gray-50 to-white">
                            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                                {/* Product Details */}
                                <div className="p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                            <Package size={20} className="text-green-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">Product Details</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                            <span className="text-sm font-medium text-gray-600">Category</span>
                                            <span className="text-sm font-semibold text-gray-900">{product.category}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                            <span className="text-sm font-medium text-gray-600">Unit</span>
                                            <span className="text-sm font-semibold text-gray-900">{product.unit}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3">
                                            <span className="text-sm font-medium text-gray-600">Stock Status</span>
                                            <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
                                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                                In Stock
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Delivery Info */}
                                <div className="p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                            <Truck size={20} className="text-blue-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">Delivery Info</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                                            <Check size={18} className="text-green-600 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">Free Delivery</p>
                                                <p className="text-xs text-gray-600 mt-1">On orders above ₹199</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                            <Check size={18} className="text-blue-600 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">Same Day Delivery</p>
                                                <p className="text-xs text-gray-600 mt-1">Order before 2 PM</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default ProductView