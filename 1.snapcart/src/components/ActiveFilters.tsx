'use client'

import { X, Search, Tag } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useRouter } from 'next/navigation'

interface Props {
    category?: string | null
    searchQuery?: string | null
}

function ActiveFilters({ category, searchQuery }: Props) {
    const router = useRouter()

    if (!category && !searchQuery) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className='flex flex-wrap items-center gap-2 mb-6'
            >
                <span className='text-sm text-gray-500 font-medium'>Active filter:</span>

                {category && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push('/')}
                        className='inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 border border-emerald-300 pl-3 pr-2 py-1.5 rounded-full text-sm font-semibold hover:bg-emerald-200 transition-all'
                    >
                        <Tag className='w-3.5 h-3.5 flex-shrink-0' />
                        <span className='max-w-[180px] truncate'>{category}</span>
                        <span className='flex items-center justify-center w-5 h-5 bg-emerald-300 hover:bg-emerald-400 rounded-full flex-shrink-0 transition-colors'>
                            <X className='w-3 h-3' />
                        </span>
                    </motion.button>
                )}

                {searchQuery && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push('/')}
                        className='inline-flex items-center gap-2 bg-blue-100 text-blue-800 border border-blue-300 pl-3 pr-2 py-1.5 rounded-full text-sm font-semibold hover:bg-blue-200 transition-all'
                    >
                        <Search className='w-3.5 h-3.5 flex-shrink-0' />
                        <span className='max-w-[180px] truncate'>"{searchQuery}"</span>
                        <span className='flex items-center justify-center w-5 h-5 bg-blue-300 hover:bg-blue-400 rounded-full flex-shrink-0 transition-colors'>
                            <X className='w-3 h-3' />
                        </span>
                    </motion.button>
                )}
            </motion.div>
        </AnimatePresence>
    )
}

export default ActiveFilters
