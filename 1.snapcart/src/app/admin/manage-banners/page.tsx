'use client'
import { ArrowLeft, Plus, Edit, Trash2, Eye, EyeOff, Loader, CheckCircle, XCircle, X, ImageIcon, Sparkles, Image as ImageLucide } from 'lucide-react'
import Link from 'next/link'
import React, { ChangeEvent, FormEvent, useState, useEffect } from 'react'
import { motion, AnimatePresence } from "motion/react"
import Image from 'next/image'
import axios from 'axios'

interface Banner {
    _id?: string
    title: string
    subtitle: string
    buttonText: string
    image: string
    isActive: boolean
    order: number
}

type ModalType = 'success' | 'error' | null

function ManageBanners() {
    const [banners, setBanners] = useState<Banner[]>([])
    const [loading, setLoading] = useState(false)
    const [submitLoading, setSubmitLoading] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
    
    // Form states
    const [title, setTitle] = useState("")
    const [subtitle, setSubtitle] = useState("")
    const [buttonText, setButtonText] = useState("")
    const [preview, setPreview] = useState<string | null>(null)
    const [backendImage, setBackendImage] = useState<File | null>(null)
    const [isActive, setIsActive] = useState(true)
    
    // Modal states
    const [modalType, setModalType] = useState<ModalType>(null)
    const [modalMessage, setModalMessage] = useState("")

    useEffect(() => {
        fetchBanners()
    }, [])

    const fetchBanners = async () => {
        setLoading(true)
        try {
            const result = await axios.get("/api/admin/get-banners")
            setBanners(result.data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return
        const file = files[0]
        setBackendImage(file)
        setPreview(URL.createObjectURL(file))
    }

    const resetForm = () => {
        setTitle("")
        setSubtitle("")
        setButtonText("")
        setPreview(null)
        setBackendImage(null)
        setIsActive(true)
        setEditingBanner(null)
        setShowForm(false)
    }

    const handleEdit = (banner: Banner) => {
        setEditingBanner(banner)
        setTitle(banner.title)
        setSubtitle(banner.subtitle)
        setButtonText(banner.buttonText)
        setPreview(banner.image)
        setIsActive(banner.isActive)
        setShowForm(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setSubmitLoading(true)
        try {
            const formData = new FormData()
            formData.append("title", title)
            formData.append("subtitle", subtitle)
            formData.append("buttonText", buttonText)
            formData.append("isActive", isActive.toString())
            
            if (backendImage) {
                formData.append("image", backendImage)
            }

            if (editingBanner) {
                // Update existing banner
                await axios.put(`/api/admin/update-banner/${editingBanner._id}`, formData)
                setModalMessage("Banner updated successfully!")
            } else {
                // Create new banner
                await axios.post("/api/admin/add-banner", formData)
                setModalMessage("Banner added successfully!")
            }

            setSubmitLoading(false)
            setModalType('success')
            resetForm()
            fetchBanners()
        } catch (error: any) {
            console.log(error)
            setSubmitLoading(false)
            setModalType('error')
            setModalMessage(error?.response?.data?.message || "Failed to save banner. Please try again.")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this banner?")) return
        
        try {
            await axios.delete(`/api/admin/delete-banner/${id}`)
            setModalType('success')
            setModalMessage("Banner deleted successfully!")
            fetchBanners()
        } catch (error: any) {
            setModalType('error')
            setModalMessage(error?.response?.data?.message || "Failed to delete banner.")
        }
    }

    const toggleActive = async (banner: Banner) => {
        try {
            await axios.patch(`/api/admin/toggle-banner/${banner._id}`, {
                isActive: !banner.isActive
            })
            fetchBanners()
        } catch (error) {
            console.log(error)
        }
    }

    const closeModal = () => {
        setModalType(null)
        setModalMessage("")
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8 px-4 relative'>
            {/* Fixed Header */}
            <div className='fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-green-100 z-40 shadow-sm'>
                <div className='max-w-7xl mx-auto px-4 py-4 flex items-center justify-between'>
                    <Link href={"/"} className='flex items-center gap-2 text-green-700 font-semibold hover:text-green-800 transition-colors group'>
                        <div className='bg-green-100 p-2 rounded-full group-hover:bg-green-200 transition-colors'>
                            <ArrowLeft className='w-5 h-5' />
                        </div>
                        <span className='hidden md:flex'>Back to Dashboard</span>
                    </Link>
                    
                    <div className='flex items-center gap-3'>
                        <div className='hidden md:flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full'>
                            <ImageIcon className='w-4 h-4 text-green-600' />
                            <span className='text-sm font-medium text-green-700'>{banners.length} Banner{banners.length !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success/Error Modal */}
            <AnimatePresence>
                {modalType && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4'
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                            className='bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full relative'
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={closeModal}
                                className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors hover:bg-gray-100 p-1 rounded-full'
                            >
                                <X className='w-5 h-5' />
                            </button>

                            <div className='flex flex-col items-center text-center'>
                                {modalType === 'success' ? (
                                    <>
                                        <motion.div
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                                            className='w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-200'
                                        >
                                            <CheckCircle className='w-14 h-14 text-white' />
                                        </motion.div>
                                        <h2 className='text-3xl font-bold text-gray-800 mb-3'>Success!</h2>
                                        <p className='text-gray-600 mb-8 text-lg'>{modalMessage}</p>
                                        <button
                                            onClick={closeModal}
                                            className='bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105'
                                        >
                                            Continue
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <motion.div
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                                            className='w-24 h-24 bg-gradient-to-br from-red-400 to-rose-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-red-200'
                                        >
                                            <XCircle className='w-14 h-14 text-white' />
                                        </motion.div>
                                        <h2 className='text-3xl font-bold text-gray-800 mb-3'>Oops!</h2>
                                        <p className='text-gray-600 mb-8 text-lg'>{modalMessage}</p>
                                        <button
                                            onClick={closeModal}
                                            className='bg-gradient-to-r from-red-500 to-rose-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-rose-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105'
                                        >
                                            Try Again
                                        </button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className='max-w-7xl mx-auto pt-24 pb-12'>
                {/* Page Header */}
                <div className='mb-8'>
                    <div className='flex items-center gap-3 mb-3'>
                        <div className='bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-2xl shadow-lg'>
                            <Sparkles className='w-8 h-8 text-white' />
                        </div>
                        <div>
                            <h1 className='text-4xl font-extrabold text-gray-800'>Banner Management</h1>
                            <p className='text-gray-500 mt-1'>Create and manage eye-catching banners for your homepage</p>
                        </div>
                    </div>
                </div>

                {/* Add Banner Button */}
                <div className='mb-8'>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            if (showForm && editingBanner) {
                                resetForm()
                            } else {
                                setShowForm(!showForm)
                            }
                        }}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all ${
                            showForm 
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                        }`}
                    >
                        {showForm ? <X className='w-5 h-5' /> : <Plus className='w-5 h-5' />}
                        {showForm ? 'Cancel' : 'Add New Banner'}
                    </motion.button>
                </div>

                {/* Form Section */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ height: 0, opacity: 0, y: -20 }}
                            animate={{ height: 'auto', opacity: 1, y: 0 }}
                            exit={{ height: 0, opacity: 0, y: -20 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className='overflow-hidden mb-8'
                        >
                            <div className='bg-white shadow-2xl rounded-3xl border-2 border-green-100 p-8'>
                                <div className='flex items-center gap-3 mb-6 pb-6 border-b-2 border-green-50'>
                                    <div className='bg-gradient-to-br from-green-400 to-emerald-500 p-2 rounded-xl'>
                                        <ImageIcon className='w-6 h-6 text-white' />
                                    </div>
                                    <h2 className='text-2xl font-bold text-gray-800'>
                                        {editingBanner ? 'Edit Banner' : 'Create New Banner'}
                                    </h2>
                                </div>
                                <form onSubmit={handleSubmit} className='space-y-6'>
                                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                                        {/* Left Column */}
                                        <div className='space-y-6'>
                                            <div>
                                                <label htmlFor="title" className='block text-gray-700 font-semibold mb-2 flex items-center gap-2'>
                                                    <span className='text-green-600'>●</span> Banner Title
                                                </label>
                                                <input
                                                    type="text"
                                                    id='title'
                                                    placeholder='Fresh Organic Groceries 🥦'
                                                    onChange={(e) => setTitle(e.target.value)}
                                                    value={title}
                                                    required
                                                    className='w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all'
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="subtitle" className='block text-gray-700 font-semibold mb-2 flex items-center gap-2'>
                                                    <span className='text-green-600'>●</span> Subtitle
                                                </label>
                                                <textarea
                                                    id='subtitle'
                                                    placeholder='Farm-fresh fruits, vegetables, and daily essentials delivered to you.'
                                                    onChange={(e) => setSubtitle(e.target.value)}
                                                    value={subtitle}
                                                    required
                                                    rows={4}
                                                    className='w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all resize-none'
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="buttonText" className='block text-gray-700 font-semibold mb-2 flex items-center gap-2'>
                                                    <span className='text-green-600'>●</span> Button Text
                                                </label>
                                                <input
                                                    type="text"
                                                    id='buttonText'
                                                    placeholder='Shop Now'
                                                    onChange={(e) => setButtonText(e.target.value)}
                                                    value={buttonText}
                                                    required
                                                    className='w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all'
                                                />
                                            </div>

                                            <div className='bg-green-50 border-2 border-green-200 rounded-xl p-4'>
                                                <label className='flex items-center gap-3 cursor-pointer group'>
                                                    <div className='relative'>
                                                        <input
                                                            type="checkbox"
                                                            id='isActive'
                                                            checked={isActive}
                                                            onChange={(e) => setIsActive(e.target.checked)}
                                                            className='w-6 h-6 text-green-600 rounded-lg focus:ring-2 focus:ring-green-400 cursor-pointer'
                                                        />
                                                    </div>
                                                    <div>
                                                        <span className='text-gray-800 font-semibold block group-hover:text-green-700 transition-colors'>Active Banner</span>
                                                        <span className='text-sm text-gray-600'>Show this banner on the website</span>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Right Column - Image Upload */}
                                        <div>
                                            <label className='block text-gray-700 font-semibold mb-2 flex items-center gap-2'>
                                                <span className='text-green-600'>●</span> Banner Image
                                            </label>
                                            <div className='border-2 border-dashed border-green-300 rounded-2xl p-6 bg-gradient-to-br from-green-50 to-emerald-50 hover:border-green-400 transition-all'>
                                                {preview ? (
                                                    <div className='relative'>
                                                        <div className='relative w-full h-64 rounded-xl overflow-hidden shadow-lg group'>
                                                            <Image src={preview} fill alt='preview' className='object-cover' />
                                                            <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                                                                <label htmlFor="image" className='cursor-pointer bg-white text-green-700 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-green-50 transition-colors'>
                                                                    <ImageLucide className='w-4 h-4' />
                                                                    Change Image
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <label htmlFor="image" className='cursor-pointer flex flex-col items-center justify-center py-12'>
                                                        <div className='bg-gradient-to-br from-green-400 to-emerald-500 p-4 rounded-2xl mb-4 shadow-lg'>
                                                            <ImageLucide className='w-12 h-12 text-white' />
                                                        </div>
                                                        <span className='text-gray-700 font-semibold mb-1'>Click to upload image</span>
                                                        <span className='text-sm text-gray-500'>Recommended: 1920 x 1080px</span>
                                                    </label>
                                                )}
                                                <input
                                                    type="file"
                                                    id='image'
                                                    accept='image/*'
                                                    hidden
                                                    onChange={handleImageChange}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className='flex gap-3 pt-4'>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            disabled={submitLoading}
                                            type='submit'
                                            className='flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2'
                                        >
                                            {submitLoading ? (
                                                <>
                                                    <Loader className='w-5 h-5 animate-spin' />
                                                    <span>Saving...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle className='w-5 h-5' />
                                                    <span>{editingBanner ? "Update Banner" : "Create Banner"}</span>
                                                </>
                                            )}
                                        </motion.button>
                                        {editingBanner && (
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                type='button'
                                                onClick={resetForm}
                                                className='px-6 py-4 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-all text-gray-700'
                                            >
                                                Cancel
                                            </motion.button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Banners List */}
                <div>
                    <h3 className='text-xl font-bold text-gray-800 mb-4 flex items-center gap-2'>
                        <ImageIcon className='w-6 h-6 text-green-600' />
                        All Banners
                    </h3>
                    <div className='grid grid-cols-1 gap-6'>
                        {loading ? (
                            <div className='flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-md'>
                                <Loader className='w-12 h-12 animate-spin text-green-600 mb-4' />
                                <p className='text-gray-500 font-medium'>Loading banners...</p>
                            </div>
                        ) : banners.length === 0 ? (
                            <div className='bg-white rounded-3xl shadow-md border-2 border-dashed border-gray-200 p-16 text-center'>
                                <div className='bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4'>
                                    <ImageIcon className='w-12 h-12 text-gray-400' />
                                </div>
                                <h3 className='text-2xl font-bold text-gray-700 mb-2'>No Banners Yet</h3>
                                <p className='text-gray-500 mb-6'>Get started by creating your first banner</p>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className='bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg inline-flex items-center gap-2'
                                >
                                    <Plus className='w-5 h-5' />
                                    Create First Banner
                                </button>
                            </div>
                        ) : (
                            banners.map((banner, index) => (
                                <motion.div
                                    key={banner._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className='bg-white rounded-3xl shadow-lg border-2 border-gray-100 overflow-hidden hover:shadow-2xl hover:border-green-200 transition-all group'
                                >
                                    <div className='flex flex-col lg:flex-row'>
                                        <div className='relative w-full lg:w-96 h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0'>
                                            <Image
                                                src={banner.image}
                                                fill
                                                alt={banner.title}
                                                className='object-cover'
                                            />
                                            {!banner.isActive && (
                                                <div className='absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center'>
                                                    <div className='bg-red-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg flex items-center gap-2'>
                                                        <EyeOff className='w-5 h-5' />
                                                        Inactive
                                                    </div>
                                                </div>
                                            )}
                                            {banner.isActive && (
                                                <div className='absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1'>
                                                    <Eye className='w-3 h-3' />
                                                    Live
                                                </div>
                                            )}
                                        </div>
                                        <div className='flex-1 p-6 lg:p-8 flex flex-col justify-between'>
                                            <div>
                                                <h3 className='text-2xl lg:text-3xl font-bold text-gray-800 mb-3 group-hover:text-green-600 transition-colors'>{banner.title}</h3>
                                                <p className='text-gray-600 mb-4 line-clamp-2'>{banner.subtitle}</p>
                                                <div className='inline-flex items-center gap-2 bg-green-50 border-2 border-green-200 text-green-700 px-4 py-2 rounded-xl text-sm font-semibold'>
                                                    <span className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></span>
                                                    {banner.buttonText}
                                                </div>
                                            </div>
                                            <div className='flex flex-wrap gap-3 mt-6'>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => toggleActive(banner)}
                                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md ${
                                                        banner.isActive
                                                            ? 'bg-green-100 text-green-700 hover:bg-green-200 border-2 border-green-300'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300'
                                                    }`}
                                                >
                                                    {banner.isActive ? <Eye className='w-4 h-4' /> : <EyeOff className='w-4 h-4' />}
                                                    {banner.isActive ? 'Active' : 'Inactive'}
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleEdit(banner)}
                                                    className='flex items-center gap-2 bg-blue-100 text-blue-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-200 transition-all border-2 border-blue-300 shadow-md'
                                                >
                                                    <Edit className='w-4 h-4' />
                                                    Edit
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleDelete(banner._id!)}
                                                    className='flex items-center gap-2 bg-red-100 text-red-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-red-200 transition-all border-2 border-red-300 shadow-md'
                                                >
                                                    <Trash2 className='w-4 h-4' />
                                                    Delete
                                                </motion.button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ManageBanners