'use client'
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
    ArrowLeft, Plus, Trash2, Loader, Tag,
    Apple, Milk, Wheat, Cookie, Flame, Coffee,
    Heart, Home, Box, Baby, ShoppingBag, Leaf,
    Beef, Star, Zap, Package, Candy, Droplets,
    Check, X
} from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'
import { ICategory } from '@/models/category.model'

const ICON_OPTIONS = [
    { label: 'Apple', value: 'Apple' },
    { label: 'Milk', value: 'Milk' },
    { label: 'Wheat', value: 'Wheat' },
    { label: 'Cookie', value: 'Cookie' },
    { label: 'Flame', value: 'Flame' },
    { label: 'Coffee', value: 'Coffee' },
    { label: 'Heart', value: 'Heart' },
    { label: 'Home', value: 'Home' },
    { label: 'Box', value: 'Box' },
    { label: 'Baby', value: 'Baby' },
    { label: 'ShoppingBag', value: 'ShoppingBag' },
    { label: 'Leaf', value: 'Leaf' },
    { label: 'Beef', value: 'Beef' },
    { label: 'Star', value: 'Star' },
    { label: 'Zap', value: 'Zap' },
    { label: 'Package', value: 'Package' },
    { label: 'Candy', value: 'Candy' },
    { label: 'Droplets', value: 'Droplets' },
]

const GRADIENT_OPTIONS = [
    { label: 'Green', value: 'from-green-400 to-emerald-500' },
    { label: 'Yellow-Orange', value: 'from-yellow-400 to-orange-500' },
    { label: 'Amber', value: 'from-amber-400 to-orange-600' },
    { label: 'Pink', value: 'from-pink-400 to-rose-500' },
    { label: 'Red', value: 'from-red-400 to-rose-600' },
    { label: 'Blue', value: 'from-blue-400 to-cyan-500' },
    { label: 'Purple-Pink', value: 'from-purple-400 to-pink-500' },
    { label: 'Lime', value: 'from-lime-400 to-green-500' },
    { label: 'Teal', value: 'from-teal-400 to-cyan-500' },
    { label: 'Rose', value: 'from-rose-400 to-pink-500' },
    { label: 'Indigo', value: 'from-indigo-400 to-purple-500' },
    { label: 'Sky', value: 'from-sky-400 to-blue-500' },
    { label: 'Orange-Red', value: 'from-orange-400 to-red-500' },
    { label: 'Violet', value: 'from-violet-400 to-indigo-500' },
    { label: 'Emerald-Teal', value: 'from-emerald-400 to-teal-500' },
]

const DEFAULT_CATEGORIES = [
    { name: 'Fruits & Vegetables', icon: 'Apple', gradient: 'from-green-400 to-emerald-500' },
    { name: 'Dairy & Eggs', icon: 'Milk', gradient: 'from-yellow-400 to-orange-500' },
    { name: 'Rice, Atta & Grains', icon: 'Wheat', gradient: 'from-amber-400 to-orange-600' },
    { name: 'Snacks & Biscuits', icon: 'Cookie', gradient: 'from-pink-400 to-rose-500' },
    { name: 'Spices & Masalas', icon: 'Flame', gradient: 'from-red-400 to-rose-600' },
    { name: 'Beverages & Drinks', icon: 'Coffee', gradient: 'from-blue-400 to-cyan-500' },
    { name: 'Personal Care', icon: 'Heart', gradient: 'from-purple-400 to-pink-500' },
    { name: 'Household Essentials', icon: 'Home', gradient: 'from-lime-400 to-green-500' },
    { name: 'Instant & Packaged Food', icon: 'Box', gradient: 'from-teal-400 to-cyan-500' },
    { name: 'Baby & Pet Care', icon: 'Baby', gradient: 'from-rose-400 to-pink-500' },
]

const iconComponentMap: Record<string, React.ElementType> = {
    Apple, Milk, Wheat, Cookie, Flame, Coffee,
    Heart, Home, Box, Baby, ShoppingBag, Leaf,
    Beef, Star, Zap, Package, Candy, Droplets, Tag
}

function getIcon(name: string): React.ElementType {
    return iconComponentMap[name] || Box
}

type ModalState = { type: 'success' | 'error', message: string } | null

function ManageCategories() {
    const [categories, setCategories] = useState<ICategory[]>([])
    const [loading, setLoading] = useState(true)
    const [name, setName] = useState('')
    const [icon, setIcon] = useState('Box')
    const [gradient, setGradient] = useState('from-green-400 to-emerald-500')
    const [adding, setAdding] = useState(false)
    const [togglingId, setTogglingId] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [seedLoading, setSeedLoading] = useState(false)
    const [modal, setModal] = useState<ModalState>(null)

    const fetchCategories = async () => {
        try {
            const res = await axios.get('/api/admin/get-categories')
            setCategories(res.data)
        } catch {
            // ignore
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return
        setAdding(true)
        try {
            await axios.post('/api/admin/add-category', { name: name.trim(), icon, gradient })
            setName('')
            setIcon('Box')
            setGradient('from-green-400 to-emerald-500')
            setModal({ type: 'success', message: `"${name.trim()}" category added!` })
            fetchCategories()
        } catch (err: any) {
            setModal({ type: 'error', message: err?.response?.data?.message || 'Failed to add category' })
        } finally {
            setAdding(false)
        }
    }

    const handleToggle = async (id: string) => {
        setTogglingId(id)
        try {
            await axios.patch(`/api/admin/toggle-category/${id}`)
            setCategories(prev =>
                prev.map(c => c._id?.toString() === id ? { ...c, enabled: !c.enabled } : c)
            )
        } catch {
            // ignore
        } finally {
            setTogglingId(null)
        }
    }

    const handleDelete = async (id: string, catName: string) => {
        if (!confirm(`Delete category "${catName}"? Existing groceries with this category won't be affected.`)) return
        setDeletingId(id)
        try {
            await axios.delete(`/api/admin/delete-category/${id}`)
            setCategories(prev => prev.filter(c => c._id?.toString() !== id))
        } catch {
            // ignore
        } finally {
            setDeletingId(null)
        }
    }

    const handleSeedDefaults = async () => {
        setSeedLoading(true)
        let added = 0
        for (const def of DEFAULT_CATEGORIES) {
            try {
                await axios.post('/api/admin/add-category', def)
                added++
            } catch {
                // skip duplicates
            }
        }
        setSeedLoading(false)
        setModal({ type: 'success', message: `Seeded ${added} default categories.` })
        fetchCategories()
    }

    const PreviewIcon = getIcon(icon)

    return (
        <div className='min-h-screen bg-gradient-to-br from-green-50 to-white py-10 px-4'>
            <div className='max-w-4xl mx-auto'>
                {/* Header */}
                <div className='flex items-center justify-between mb-8'>
                    <Link
                        href='/'
                        className='flex items-center gap-2 text-green-700 font-semibold bg-white px-4 py-2 rounded-full shadow-md hover:bg-green-100 transition-all'
                    >
                        <ArrowLeft className='w-5 h-5' />
                        <span className='hidden sm:inline'>Back to home</span>
                    </Link>
                    <h1 className='text-2xl md:text-3xl font-extrabold text-green-700 flex items-center gap-2'>
                        <Tag className='w-7 h-7' /> Manage Categories
                    </h1>
                </div>

                {/* Add Category Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='bg-white rounded-2xl shadow-md border border-green-100 p-6 mb-8'
                >
                    <h2 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
                        <Plus className='w-5 h-5 text-green-600' /> Add New Category
                    </h2>
                    <form onSubmit={handleAdd} className='space-y-4'>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Category Name <span className='text-red-500'>*</span></label>
                            <input
                                type='text'
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder='e.g. Bakery & Breads'
                                required
                                className='w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-400 transition-all'
                            />
                        </div>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Icon <span className='text-red-500'>*</span></label>
                                <select
                                    value={icon}
                                    onChange={e => setIcon(e.target.value)}
                                    className='w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-400 transition-all bg-white'
                                >
                                    {ICON_OPTIONS.map(o => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Color Gradient <span className='text-red-500'>*</span></label>
                                <select
                                    value={gradient}
                                    onChange={e => setGradient(e.target.value)}
                                    className='w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-400 transition-all bg-white'
                                >
                                    {GRADIENT_OPTIONS.map(o => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className='flex items-center gap-3'>
                            <span className='text-sm text-gray-500'>Preview:</span>
                            <div className={`flex items-center gap-2 bg-gradient-to-br ${gradient} text-white px-4 py-2 rounded-xl shadow-md`}>
                                <PreviewIcon className='w-5 h-5' />
                                <span className='text-sm font-semibold'>{name || 'Category Name'}</span>
                            </div>
                        </div>

                        <div className='flex gap-3'>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type='submit'
                                disabled={adding}
                                className='flex items-center gap-2 bg-green-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-green-700 disabled:opacity-60 transition-all'
                            >
                                {adding ? <Loader className='w-4 h-4 animate-spin' /> : <Plus className='w-4 h-4' />}
                                Add Category
                            </motion.button>
                            {categories.length === 0 && !loading && (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type='button'
                                    onClick={handleSeedDefaults}
                                    disabled={seedLoading}
                                    className='flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-all'
                                >
                                    {seedLoading ? <Loader className='w-4 h-4 animate-spin' /> : <Zap className='w-4 h-4' />}
                                    Load Defaults
                                </motion.button>
                            )}
                        </div>
                    </form>
                </motion.div>

                {/* Categories List */}
                <div className='bg-white rounded-2xl shadow-md border border-green-100 p-6'>
                    <div className='flex items-center justify-between mb-5'>
                        <h2 className='text-lg font-bold text-gray-800'>
                            All Categories
                            <span className='ml-2 text-sm font-normal text-gray-500'>({categories.length} total)</span>
                        </h2>
                        {categories.length > 0 && (
                            <span className='text-xs text-gray-500'>
                                {categories.filter(c => c.enabled).length} enabled · {categories.filter(c => !c.enabled).length} disabled
                            </span>
                        )}
                    </div>

                    {loading ? (
                        <div className='flex justify-center py-10'>
                            <Loader className='w-8 h-8 animate-spin text-green-600' />
                        </div>
                    ) : categories.length === 0 ? (
                        <div className='text-center py-10 text-gray-500'>
                            <Tag className='w-12 h-12 mx-auto text-gray-300 mb-3' />
                            <p className='font-medium'>No categories yet.</p>
                            <p className='text-sm mt-1'>Add one above or click <strong>Load Defaults</strong> to seed the standard categories.</p>
                        </div>
                    ) : (
                        <div className='space-y-3'>
                            <AnimatePresence>
                                {categories.map((cat) => {
                                    const CatIcon = getIcon(cat.icon)
                                    const id = cat._id?.toString() || ''
                                    const isToggling = togglingId === id
                                    const isDeleting = deletingId === id

                                    return (
                                        <motion.div
                                            key={id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -30 }}
                                            className={`flex items-center justify-between gap-4 p-4 rounded-xl border transition-all ${cat.enabled ? 'border-green-200 bg-green-50/40' : 'border-gray-200 bg-gray-50 opacity-60'}`}
                                        >
                                            <div className='flex items-center gap-3'>
                                                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center shadow-sm flex-shrink-0`}>
                                                    <CatIcon className='w-6 h-6 text-white' />
                                                </div>
                                                <div>
                                                    <p className='font-semibold text-gray-800'>{cat.name}</p>
                                                    <p className='text-xs text-gray-500'>{cat.icon} · {cat.enabled ? 'Enabled' : 'Disabled'}</p>
                                                </div>
                                            </div>

                                            <div className='flex items-center gap-2 flex-shrink-0'>
                                                {/* Toggle Button */}
                                                <button
                                                    onClick={() => handleToggle(id)}
                                                    disabled={isToggling}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                                        cat.enabled
                                                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                                    }`}
                                                >
                                                    {isToggling
                                                        ? <Loader className='w-3.5 h-3.5 animate-spin' />
                                                        : cat.enabled
                                                            ? <><Check className='w-3.5 h-3.5' /> Enabled</>
                                                            : <><X className='w-3.5 h-3.5' /> Disabled</>
                                                    }
                                                </button>

                                                {/* Delete Button */}
                                                <button
                                                    onClick={() => handleDelete(id, cat.name)}
                                                    disabled={isDeleting}
                                                    className='p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all'
                                                >
                                                    {isDeleting ? <Loader className='w-4 h-4 animate-spin' /> : <Trash2 className='w-4 h-4' />}
                                                </button>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {modal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4'
                        onClick={() => setModal(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className='bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center'
                            onClick={e => e.stopPropagation()}
                        >
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${modal.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                                {modal.type === 'success'
                                    ? <Check className='w-9 h-9 text-green-600' />
                                    : <X className='w-9 h-9 text-red-600' />
                                }
                            </div>
                            <h3 className='text-xl font-bold text-gray-800 mb-2'>
                                {modal.type === 'success' ? 'Done!' : 'Error'}
                            </h3>
                            <p className='text-gray-600 mb-5'>{modal.message}</p>
                            <button
                                onClick={() => setModal(null)}
                                className={`px-6 py-2.5 rounded-xl font-semibold text-white transition-all ${modal.type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                            >
                                OK
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default ManageCategories
