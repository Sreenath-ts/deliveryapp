'use client'
import React, { ChangeEvent, FormEvent, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
    ArrowLeft, Plus, Edit, Trash2, Eye, EyeOff, Loader,
    CheckCircle, XCircle, X, ImageIcon, Sparkles, ChevronUp,
    ChevronDown, Zap, ShoppingBasket, ArrowRight, Image as ImageLucide,
    Type, LayoutTemplate
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import axios from 'axios'

/* ─── Types ─── */
interface Banner {
    _id?: string
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

type ModalType = 'success' | 'error' | null

/* ─── Gradient options ─── */
const GRADIENTS = [
    { label: 'Fiery Red', value: 'from-red-600 to-orange-500' },
    { label: 'Flash Orange', value: 'from-orange-500 to-amber-400' },
    { label: 'Warm Gold', value: 'from-yellow-600 to-amber-500' },
    { label: 'Fresh Green', value: 'from-green-700 to-emerald-500' },
    { label: 'Teal', value: 'from-teal-600 to-cyan-500' },
    { label: 'Ocean Blue', value: 'from-blue-700 to-cyan-500' },
    { label: 'Royal Purple', value: 'from-purple-700 to-indigo-600' },
    { label: 'Berry', value: 'from-purple-800 to-pink-600' },
    { label: 'Pink Rose', value: 'from-rose-600 to-pink-500' },
    { label: 'Dark Night', value: 'from-slate-900 to-slate-700' },
]

const BADGE_SUGGESTIONS = ['Flash Sale', 'Deal of the Day', 'Limited Time', 'New Arrival', 'Weekend Special', 'Season Offer']

/* ─── Mini live preview ─── */
function BannerPreview({
    type, title, subtitle, buttonText, badge, imagePreview, bgGradient, darkText,
}: {
    type: 'image' | 'text'; title: string; subtitle: string; buttonText: string
    badge?: string; imagePreview?: string | null; bgGradient: string; darkText: boolean
}) {
    const tc = darkText ? 'text-slate-900' : 'text-white'
    const stc = darkText ? 'text-slate-700' : 'text-white/80'
    const btnCls = darkText ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'

    return (
        <div className='relative w-full overflow-hidden rounded-2xl' style={{ aspectRatio: '16/7' }}>
            {/* Background */}
            {type === 'image' && imagePreview ? (
                <img src={imagePreview} className='absolute inset-0 h-full w-full object-cover' alt='preview' />
            ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient}`} />
            )}
            {type === 'image' && imagePreview && (
                <div className='absolute inset-0 bg-[linear-gradient(105deg,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.50)_55%,rgba(0,0,0,0.15)_100%)]' />
            )}

            {/* Content */}
            <div className='relative flex h-full flex-col justify-center px-5 py-4'>
                {badge && (
                    <div className='mb-2 inline-flex w-fit items-center gap-1 rounded-full border border-yellow-400/40 bg-yellow-400/15 px-2.5 py-1'>
                        <Zap className='h-2.5 w-2.5 fill-yellow-300 text-yellow-300' />
                        <span className='text-[10px] font-bold uppercase tracking-widest text-yellow-200'>{badge}</span>
                    </div>
                )}
                <h2 className={`text-lg font-black leading-tight ${tc} line-clamp-2`}>
                    {title || 'Banner Headline'}
                </h2>
                <p className={`mt-1 text-xs leading-relaxed ${stc} line-clamp-2`}>
                    {subtitle || 'Your banner subtitle will appear here.'}
                </p>
                <div className={`mt-3 inline-flex w-fit items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold ${btnCls} shadow-lg`}>
                    <ShoppingBasket className='h-3 w-3' />
                    {buttonText || 'Shop Now'}
                    <ArrowRight className='h-3 w-3' />
                </div>
            </div>
        </div>
    )
}

/* ─── Main component ─── */
function ManageBanners() {
    const [banners, setBanners] = useState<Banner[]>([])
    const [loading, setLoading] = useState(false)
    const [submitLoading, setSubmitLoading] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null)

    /* Form state */
    const [bannerType, setBannerType] = useState<'image' | 'text'>('image')
    const [title, setTitle] = useState('')
    const [subtitle, setSubtitle] = useState('')
    const [buttonText, setButtonText] = useState('Shop Now')
    const [buttonLink, setButtonLink] = useState('')
    const [badge, setBadge] = useState('')
    const [bgGradient, setBgGradient] = useState(GRADIENTS[0].value)
    const [darkText, setDarkText] = useState(false)
    const [preview, setPreview] = useState<string | null>(null)
    const [backendImage, setBackendImage] = useState<File | null>(null)
    const [isActive, setIsActive] = useState(true)

    /* Modal */
    const [modalType, setModalType] = useState<ModalType>(null)
    const [modalMessage, setModalMessage] = useState('')

    useEffect(() => { fetchBanners() }, [])

    const fetchBanners = async () => {
        setLoading(true)
        try {
            const res = await axios.get('/api/admin/get-banners')
            setBanners(res.data)
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    const resetForm = () => {
        setBannerType('image'); setTitle(''); setSubtitle(''); setButtonText('Shop Now')
        setButtonLink(''); setBadge(''); setBgGradient(GRADIENTS[0].value); setDarkText(false)
        setPreview(null); setBackendImage(null); setIsActive(true)
        setEditingBanner(null); setShowForm(false)
    }

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setBackendImage(file)
        setPreview(URL.createObjectURL(file))
    }

    const handleEdit = (b: Banner) => {
        setEditingBanner(b)
        setBannerType(b.type || 'image')
        setTitle(b.title); setSubtitle(b.subtitle); setButtonText(b.buttonText)
        setButtonLink(b.buttonLink || ''); setBadge(b.badge || ''); setBgGradient(b.bgGradient || GRADIENTS[0].value)
        setDarkText(b.textColor === 'dark'); setPreview(b.image || null)
        setIsActive(b.isActive); setBackendImage(null); setShowForm(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setSubmitLoading(true)
        try {
            const fd = new FormData()
            fd.append('type', bannerType)
            fd.append('title', title)
            fd.append('subtitle', subtitle)
            fd.append('buttonText', buttonText)
            fd.append('buttonLink', buttonLink)
            fd.append('badge', badge)
            fd.append('bgGradient', bgGradient)
            fd.append('textColor', darkText ? 'dark' : 'white')
            fd.append('isActive', isActive.toString())
            if (backendImage) fd.append('image', backendImage)

            if (editingBanner) {
                await axios.put(`/api/admin/update-banner/${editingBanner._id}`, fd)
                setModalMessage('Banner updated successfully!')
            } else {
                await axios.post('/api/admin/add-banner', fd)
                setModalMessage('Banner created successfully!')
            }
            setModalType('success')
            resetForm()
            fetchBanners()
        } catch (err: any) {
            setModalType('error')
            setModalMessage(err?.response?.data?.message || 'Failed to save banner.')
        } finally {
            setSubmitLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this banner?')) return
        try {
            await axios.delete(`/api/admin/delete-banner/${id}`)
            setModalType('success'); setModalMessage('Banner deleted.')
            fetchBanners()
        } catch (err: any) {
            setModalType('error'); setModalMessage(err?.response?.data?.message || 'Failed to delete.')
        }
    }

    const toggleActive = async (b: Banner) => {
        try {
            await axios.patch(`/api/admin/toggle-banner/${b._id}`, { isActive: !b.isActive })
            fetchBanners()
        } catch (e) { console.error(e) }
    }

    const moveOrder = async (idx: number, dir: 'up' | 'down') => {
        const swapIdx = dir === 'up' ? idx - 1 : idx + 1
        if (swapIdx < 0 || swapIdx >= banners.length) return
        try {
            await axios.post('/api/admin/swap-banner-order', {
                idA: banners[idx]._id,
                idB: banners[swapIdx]._id,
            })
            fetchBanners()
        } catch (e) { console.error(e) }
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-slate-50 via-green-50/40 to-white'>

            {/* ─── Top bar ─── */}
            <div className='sticky top-0 z-40 border-b border-green-100 bg-white/80 backdrop-blur-lg shadow-sm'>
                <div className='mx-auto flex max-w-7xl items-center justify-between px-4 py-4'>
                    <Link href='/' className='group flex items-center gap-2 font-semibold text-green-700 transition hover:text-green-800'>
                        <div className='rounded-full bg-green-100 p-2 transition group-hover:bg-green-200'>
                            <ArrowLeft className='h-5 w-5' />
                        </div>
                        <span className='hidden sm:inline'>Back to Dashboard</span>
                    </Link>
                    <h1 className='flex items-center gap-2 text-lg font-extrabold text-gray-800 sm:text-xl'>
                        <LayoutTemplate className='h-5 w-5 text-green-600' />
                        Banner Management
                    </h1>
                    <div className='flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-700'>
                        <ImageIcon className='h-4 w-4' />
                        {banners.length} banner{banners.length !== 1 ? 's' : ''}
                    </div>
                </div>
            </div>

            {/* ─── Modal ─── */}
            <AnimatePresence>
                {modalType && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm'
                        onClick={() => setModalType(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }} transition={{ type: 'spring', bounce: 0.3 }}
                            className='relative w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl text-center'
                            onClick={e => e.stopPropagation()}
                        >
                            <button onClick={() => setModalType(null)} className='absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition'>
                                <X className='h-5 w-5' />
                            </button>
                            <div className={`mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full ${modalType === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                                {modalType === 'success'
                                    ? <CheckCircle className='h-12 w-12 text-green-600' />
                                    : <XCircle className='h-12 w-12 text-red-600' />}
                            </div>
                            <h2 className='mb-2 text-2xl font-bold text-gray-800'>{modalType === 'success' ? 'Done!' : 'Error'}</h2>
                            <p className='mb-6 text-gray-600'>{modalMessage}</p>
                            <button
                                onClick={() => setModalType(null)}
                                className={`rounded-xl px-8 py-3 font-semibold text-white transition ${modalType === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                            >OK</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className='mx-auto max-w-7xl px-4 py-8'>

                {/* ─── Add button ─── */}
                <div className='mb-6 flex items-center justify-between'>
                    <h2 className='text-2xl font-extrabold text-gray-800'>
                        {showForm ? (editingBanner ? 'Edit Banner' : 'New Banner') : 'All Banners'}
                    </h2>
                    <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => { if (showForm) resetForm(); else setShowForm(true) }}
                        className={`flex items-center gap-2 rounded-xl px-5 py-2.5 font-semibold shadow-md transition ${showForm ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'}`}
                    >
                        {showForm ? <><X className='h-4 w-4' /> Cancel</> : <><Plus className='h-4 w-4' /> Add Banner</>}
                    </motion.button>
                </div>

                {/* ─── Form ─── */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35 }}
                            className='mb-8 overflow-hidden'
                        >
                            <div className='rounded-3xl border-2 border-green-100 bg-white p-6 shadow-xl sm:p-8'>

                                {/* Banner type toggle */}
                                <div className='mb-6 flex gap-3'>
                                    {(['image', 'text'] as const).map(t => (
                                        <button
                                            key={t}
                                            type='button'
                                            onClick={() => setBannerType(t)}
                                            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition sm:flex-none sm:px-6 ${bannerType === t ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                                        >
                                            {t === 'image' ? <ImageLucide className='h-4 w-4' /> : <Type className='h-4 w-4' />}
                                            {t === 'image' ? 'Image Banner' : 'Text + Color'}
                                        </button>
                                    ))}
                                </div>

                                {/* Two-column: form + live preview */}
                                <form onSubmit={handleSubmit}>
                                    <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>

                                        {/* LEFT — fields */}
                                        <div className='space-y-5'>
                                            {/* Title */}
                                            <div>
                                                <label className='mb-1.5 block text-sm font-semibold text-gray-700'>Headline <span className='text-red-500'>*</span></label>
                                                <input
                                                    type='text' value={title} onChange={e => setTitle(e.target.value)}
                                                    required placeholder='e.g. 50% Off Fresh Fruits Today'
                                                    className='w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100'
                                                />
                                            </div>

                                            {/* Subtitle */}
                                            <div>
                                                <label className='mb-1.5 block text-sm font-semibold text-gray-700'>Subtitle <span className='text-red-500'>*</span></label>
                                                <textarea
                                                    value={subtitle} onChange={e => setSubtitle(e.target.value)}
                                                    required rows={3} placeholder='Farm-fresh produce delivered in 30 minutes.'
                                                    className='w-full resize-none rounded-xl border-2 border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100'
                                                />
                                            </div>

                                            {/* CTA + Badge row */}
                                            <div className='grid grid-cols-2 gap-3'>
                                                <div>
                                                    <label className='mb-1.5 block text-sm font-semibold text-gray-700'>CTA Button <span className='text-xs font-normal text-gray-400'>(optional)</span></label>
                                                    <input
                                                        type='text' value={buttonText} onChange={e => setButtonText(e.target.value)}
                                                        placeholder='Shop Now'
                                                        className='w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100'
                                                    />
                                                </div>
                                                <div>
                                                    <label className='mb-1.5 block text-sm font-semibold text-gray-700'>Badge / Tag <span className='text-xs font-normal text-gray-400'>(optional)</span></label>
                                                    <input
                                                        type='text' value={badge} onChange={e => setBadge(e.target.value)}
                                                        placeholder='Flash Sale'
                                                        className='w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100'
                                                    />
                                                    {/* Badge quick-select */}
                                                    <div className='mt-1.5 flex flex-wrap gap-1'>
                                                        {BADGE_SUGGESTIONS.map(s => (
                                                            <button
                                                                key={s} type='button' onClick={() => setBadge(s)}
                                                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition ${badge === s ? 'bg-yellow-400 text-slate-900' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                                            >{s}</button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* CTA Link */}
                                            <div>
                                                <label className='mb-1.5 block text-sm font-semibold text-gray-700'>
                                                    CTA Button Link <span className='text-xs font-normal text-gray-400'>(optional — where the button navigates)</span>
                                                </label>
                                                <input
                                                    type='url' value={buttonLink} onChange={e => setButtonLink(e.target.value)}
                                                    placeholder='https://example.com/sale or /products/fruits'
                                                    className='w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100'
                                                />
                                                <p className='mt-1 text-xs text-gray-400'>Leave empty to scroll to the products section on click.</p>
                                            </div>

                                            {/* Image upload (image type) */}
                                            {bannerType === 'image' && (
                                                <div>
                                                    <label className='mb-1.5 block text-sm font-semibold text-gray-700'>
                                                        Banner Image <span className='text-red-500'>{!editingBanner ? '*' : ''}</span>
                                                        {editingBanner && <span className='ml-1 text-xs font-normal text-gray-400'>(leave blank to keep current)</span>}
                                                    </label>
                                                    <div className='relative overflow-hidden rounded-2xl border-2 border-dashed border-green-300 bg-green-50/50'>
                                                        {preview ? (
                                                            <div className='group relative aspect-video w-full'>
                                                                <Image src={preview} fill alt='preview' className='object-cover' />
                                                                <div className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100'>
                                                                    <label htmlFor='image' className='flex cursor-pointer items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50 transition'>
                                                                        <ImageLucide className='h-4 w-4' /> Change Image
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <label htmlFor='image' className='flex cursor-pointer flex-col items-center justify-center py-10'>
                                                                <div className='mb-3 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 p-4 shadow-lg'>
                                                                    <ImageLucide className='h-8 w-8 text-white' />
                                                                </div>
                                                                <p className='font-semibold text-gray-700'>Click to upload</p>
                                                                <p className='mt-1 text-xs text-gray-400'>Recommended: 1920 × 1080 px</p>
                                                            </label>
                                                        )}
                                                        <input type='file' id='image' accept='image/*' hidden onChange={handleImageChange} />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Gradient + text color (text type) */}
                                            {bannerType === 'text' && (
                                                <div className='space-y-4'>
                                                    <div>
                                                        <label className='mb-2 block text-sm font-semibold text-gray-700'>Background Gradient <span className='text-red-500'>*</span></label>
                                                        <div className='grid grid-cols-5 gap-2'>
                                                            {GRADIENTS.map(g => (
                                                                <button
                                                                    key={g.value} type='button' onClick={() => setBgGradient(g.value)}
                                                                    title={g.label}
                                                                    className={`aspect-square rounded-xl bg-gradient-to-br ${g.value} transition hover:scale-105 ${bgGradient === g.value ? 'ring-3 ring-offset-2 ring-green-500 scale-105' : ''}`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className='flex items-center gap-3 rounded-xl border-2 border-gray-200 p-4'>
                                                        <button
                                                            type='button'
                                                            onClick={() => setDarkText(false)}
                                                            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${!darkText ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                                        >White Text</button>
                                                        <button
                                                            type='button'
                                                            onClick={() => setDarkText(true)}
                                                            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${darkText ? 'bg-white border border-gray-300 text-slate-900 shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                                        >Dark Text</button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Active toggle */}
                                            <label className='flex cursor-pointer items-center gap-3 rounded-xl border-2 border-gray-200 p-4 transition hover:border-green-300'>
                                                <div
                                                    onClick={() => setIsActive(p => !p)}
                                                    className={`relative h-6 w-11 rounded-full transition-colors ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                                                >
                                                    <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                                </div>
                                                <div>
                                                    <p className='text-sm font-semibold text-gray-800'>{isActive ? 'Active — visible on homepage' : 'Inactive — hidden from users'}</p>
                                                </div>
                                            </label>
                                        </div>

                                        {/* RIGHT — live preview */}
                                        <div className='lg:sticky lg:top-24 self-start'>
                                            <p className='mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700'>
                                                <Sparkles className='h-4 w-4 text-green-600' /> Live Preview
                                            </p>
                                            <BannerPreview
                                                type={bannerType}
                                                title={title}
                                                subtitle={subtitle}
                                                buttonText={buttonText}
                                                badge={badge}
                                                imagePreview={preview}
                                                bgGradient={bgGradient}
                                                darkText={darkText}
                                            />
                                            <p className='mt-2 text-center text-xs text-gray-400'>Preview updates as you type</p>
                                        </div>
                                    </div>

                                    {/* Submit row */}
                                    <div className='mt-8 flex gap-3'>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                            disabled={submitLoading} type='submit'
                                            className='flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 py-4 font-bold text-white shadow-lg transition hover:from-green-600 hover:to-emerald-700 disabled:opacity-60 sm:flex-none sm:px-10'
                                        >
                                            {submitLoading ? <><Loader className='h-5 w-5 animate-spin' /> Saving…</> : <><CheckCircle className='h-5 w-5' />{editingBanner ? 'Update Banner' : 'Publish Banner'}</>}
                                        </motion.button>
                                        <button type='button' onClick={resetForm}
                                            className='rounded-xl border-2 border-gray-300 px-6 py-4 font-semibold text-gray-700 transition hover:bg-gray-50'
                                        >Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ─── Banner list ─── */}
                {loading ? (
                    <div className='flex flex-col items-center justify-center rounded-3xl bg-white py-20 shadow-md'>
                        <Loader className='mb-4 h-10 w-10 animate-spin text-green-600' />
                        <p className='text-gray-500'>Loading banners…</p>
                    </div>
                ) : banners.length === 0 ? (
                    <div className='rounded-3xl border-2 border-dashed border-gray-200 bg-white p-16 text-center shadow-md'>
                        <div className='mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100'>
                            <ImageIcon className='h-10 w-10 text-gray-400' />
                        </div>
                        <h3 className='mb-2 text-xl font-bold text-gray-700'>No Banners Yet</h3>
                        <p className='mb-6 text-gray-500'>Create your first banner to engage shoppers on the homepage.</p>
                        <button onClick={() => setShowForm(true)}
                            className='inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 font-semibold text-white shadow-lg hover:from-green-600 hover:to-emerald-700 transition'
                        >
                            <Plus className='h-5 w-5' /> Create First Banner
                        </button>
                    </div>
                ) : (
                    <div className='space-y-4'>
                        <AnimatePresence>
                            {banners.map((banner, idx) => (
                                <motion.div
                                    key={banner._id}
                                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }} transition={{ delay: idx * 0.06 }}
                                    className={`group overflow-hidden rounded-2xl border-2 bg-white shadow-md transition hover:shadow-xl ${banner.isActive ? 'border-green-100 hover:border-green-200' : 'border-gray-200 opacity-70'}`}
                                >
                                    <div className='flex flex-col sm:flex-row'>
                                        {/* Thumbnail */}
                                        <div className='relative h-44 w-full flex-shrink-0 sm:h-auto sm:w-52'>
                                            {banner.type === 'image' && banner.image ? (
                                                <Image src={banner.image} fill alt={banner.title} className='object-cover' />
                                            ) : (
                                                <div className={`h-full w-full bg-gradient-to-br ${banner.bgGradient || 'from-slate-700 to-slate-900'} flex items-center justify-center`}>
                                                    <Type className='h-10 w-10 text-white/40' />
                                                </div>
                                            )}
                                            {/* Status overlay */}
                                            {!banner.isActive && (
                                                <div className='absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur-[2px]'>
                                                    <div className='flex items-center gap-1.5 rounded-full bg-red-500 px-4 py-1.5 text-xs font-bold text-white shadow-lg'>
                                                        <EyeOff className='h-3.5 w-3.5' /> Inactive
                                                    </div>
                                                </div>
                                            )}
                                            {banner.isActive && (
                                                <div className='absolute left-2 top-2 flex items-center gap-1 rounded-full bg-green-500/90 px-2.5 py-1 text-[10px] font-bold text-white shadow'>
                                                    <Eye className='h-3 w-3' /> Live
                                                </div>
                                            )}
                                            {/* Type badge */}
                                            <div className='absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm'>
                                                {banner.type}
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className='flex flex-1 flex-col justify-between p-5 sm:p-6'>
                                            <div>
                                                {banner.badge && (
                                                    <span className='mb-2 inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-bold text-yellow-700'>
                                                        <Zap className='h-3 w-3' /> {banner.badge}
                                                    </span>
                                                )}
                                                <h3 className='text-xl font-bold text-gray-800 group-hover:text-green-700 transition line-clamp-1'>{banner.title}</h3>
                                                <p className='mt-1 text-sm text-gray-500 line-clamp-2'>{banner.subtitle}</p>
                                                <div className='mt-2 flex flex-wrap items-center gap-2'>
                                                    <div className='inline-flex items-center gap-1.5 rounded-lg bg-green-50 border border-green-200 px-3 py-1.5 text-xs font-semibold text-green-700'>
                                                        <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-green-500' />
                                                        CTA: {banner.buttonText}
                                                    </div>
                                                    {banner.buttonLink && (
                                                        <a
                                                            href={banner.buttonLink}
                                                            target='_blank'
                                                            rel='noopener noreferrer'
                                                            className='inline-flex items-center gap-1 rounded-lg bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-100 transition truncate max-w-[220px]'
                                                            title={banner.buttonLink}
                                                        >
                                                            <ArrowRight className='h-3 w-3 flex-shrink-0' />
                                                            {banner.buttonLink}
                                                        </a>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action row */}
                                            <div className='mt-4 flex flex-wrap items-center gap-2'>
                                                {/* Reorder */}
                                                <div className='flex gap-1'>
                                                    <button onClick={() => moveOrder(idx, 'up')} disabled={idx === 0}
                                                        className='flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500 transition hover:bg-gray-100 disabled:opacity-30'
                                                        title='Move up'
                                                    ><ChevronUp className='h-4 w-4' /></button>
                                                    <button onClick={() => moveOrder(idx, 'down')} disabled={idx === banners.length - 1}
                                                        className='flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500 transition hover:bg-gray-100 disabled:opacity-30'
                                                        title='Move down'
                                                    ><ChevronDown className='h-4 w-4' /></button>
                                                </div>

                                                <button onClick={() => toggleActive(banner)}
                                                    className={`flex items-center gap-1.5 rounded-lg border-2 px-4 py-2 text-xs font-semibold transition ${banner.isActive ? 'border-green-300 bg-green-100 text-green-700 hover:bg-green-200' : 'border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                                >
                                                    {banner.isActive ? <><Eye className='h-3.5 w-3.5' />Active</> : <><EyeOff className='h-3.5 w-3.5' />Inactive</>}
                                                </button>

                                                <button onClick={() => handleEdit(banner)}
                                                    className='flex items-center gap-1.5 rounded-lg border-2 border-blue-300 bg-blue-100 px-4 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-200'
                                                >
                                                    <Edit className='h-3.5 w-3.5' /> Edit
                                                </button>

                                                <button onClick={() => handleDelete(banner._id!)}
                                                    className='flex items-center gap-1.5 rounded-lg border-2 border-red-300 bg-red-100 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-200'
                                                >
                                                    <Trash2 className='h-3.5 w-3.5' /> Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ManageBanners
