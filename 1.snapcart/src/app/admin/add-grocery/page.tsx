'use client'
import { ArrowLeft, Loader, Plus, PlusCircle, Upload, CheckCircle, XCircle, X } from 'lucide-react'
import Link from 'next/link'
import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { motion, AnimatePresence } from "motion/react"
import Image from 'next/image'
import axios from 'axios'

const units = [
    "kg", "g", "liter", "ml", "piece", "pack"
]

type ModalType = 'success' | 'error' | null

function AddGrocery() {
    const [name, setName] = useState("")
    const [category, setCategory] = useState("")
    const [categories, setCategories] = useState<string[]>([])
    const [unit, setUnit] = useState("")
    const [price, setPrice] = useState("")
    const [offerPrice, setOfferPrice] = useState("")
    const [loading, setLoading] = useState(false)
    const [preview, setPreview] = useState<string | null>()
    const [backendImage, setBackendImage] = useState<File | null>()
    const [modalType, setModalType] = useState<ModalType>(null)
    const [modalMessage, setModalMessage] = useState("")

    useEffect(() => {
        axios.get('/api/admin/get-categories')
            .then(res => setCategories(res.data.map((c: any) => c.name)))
            .catch(() => {})
    }, [])

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length == 0) return
        const file = files[0]
        setBackendImage(file)
        setPreview(URL.createObjectURL(file))
    }

    const resetForm = () => {
        setName("")
        setCategory("")
        setUnit("")
        setPrice("")
        setOfferPrice("")
        setPreview(null)
        setBackendImage(null)
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append("name", name)
            formData.append("category", category)
            formData.append("price", price)
            formData.append("offerPrice", offerPrice)
            formData.append("unit", unit)
            if (backendImage) {
                formData.append("image", backendImage)
            }

            const result = await axios.post("/api/admin/add-grocery", formData)
            console.log(result.data)
            setLoading(false)
            setModalType('success')
            setModalMessage(`${name} has been added successfully!`)
            resetForm()
        } catch (error: any) {
            console.log(error)
            setLoading(false)
            setModalType('error')
            setModalMessage(error?.response?.data?.message || "Failed to add grocery. Please try again.")
        }
    }

    const closeModal = () => {
        setModalType(null)
        setModalMessage("")
    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white py-16 px-4 relative'>
            <Link href={"/"} className='absolute top-6 left-6 flex items-center gap-2 text-green-700 font-semibold bg-white px-4 py-2 rounded-full shadow-md hover:bg-green-100 hover:shadow-lg transition-all'>
                <ArrowLeft className='w-5 h-5' />
                <span className='hidden md:flex'>Back to home</span>
            </Link>

            {/* Success/Error Modal */}
            <AnimatePresence>
                {modalType && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4'
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", duration: 0.3 }}
                            className='bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative'
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={closeModal}
                                className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors'
                            >
                                <X className='w-5 h-5' />
                            </button>

                            <div className='flex flex-col items-center text-center'>
                                {modalType === 'success' ? (
                                    <>
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                                            className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4'
                                        >
                                            <CheckCircle className='w-12 h-12 text-green-600' />
                                        </motion.div>
                                        <h2 className='text-2xl font-bold text-gray-800 mb-2'>Success!</h2>
                                        <p className='text-gray-600 mb-6'>{modalMessage}</p>
                                        <button
                                            onClick={closeModal}
                                            className='bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors'
                                        >
                                            Add Another
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                                            className='w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4'
                                        >
                                            <XCircle className='w-12 h-12 text-red-600' />
                                        </motion.div>
                                        <h2 className='text-2xl font-bold text-gray-800 mb-2'>Oops!</h2>
                                        <p className='text-gray-600 mb-6'>{modalMessage}</p>
                                        <button
                                            onClick={closeModal}
                                            className='bg-red-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors'
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

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className='bg-white w-full max-w-2xl shadow-2xl rounded-3xl border border-green-100 p-8'
            >
                <div className='flex flex-col items-center mb-8'>
                    <div className='flex items-center gap-3'>
                        <PlusCircle className='text-green-600 w-8 h-8' />
                        <h1>Add Your Grocery</h1>
                    </div>
                    <p className='text-gray-500 text-sm mt-2 text-center'>Fill out the details below to add a new grocery item.
                    </p>
                </div>
                <form className='flex flex-col gap-6 w-full ' onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="name" className='block text-gray-700 font-medium mb-1'> Grocery Name <span className='text-red-500'>*</span></label>
                        <input
                            type="text"
                            id='name'
                            placeholder='eg: sweets, Milk ...'
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                            required
                            className='w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-400 transition-all' />
                    </div>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                        <div >
                            <label className='block text-gray-700 font-medium mb-1'>Category<span className='text-red-500'>*</span></label>
                            <select
                                name="category"
                                value={category}
                                required
                                className='w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-400 transition-all bg-white'
                                onChange={(e) => setCategory(e.target.value)}>
                                <option value="">Select Category</option>
                                {categories.map((cat, i) => (
                                    <option key={i} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className='block text-gray-700 font-medium mb-1'>Unit<span className='text-red-500'>*</span></label>
                            <select
                                name="unit"
                                className='w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-400 transition-all bg-white'
                                onChange={(e) => setUnit(e.target.value)}
                                value={unit}
                                required
                            >
                                <option value="">Select Unit</option>
                                {units.map((cat, i) => (
                                    <option key={i} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                        <div>
                            <label htmlFor="price" className='block text-gray-700 font-medium mb-1'> Price <span className='text-red-500'>*</span></label>
                            <input
                                type="number"
                                id='price'
                                placeholder='eg. 120'
                                className='w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-400 transition-all'
                                onChange={(e) => setPrice(e.target.value)}
                                value={price}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="offerPrice" className='block text-gray-700 font-medium mb-1'> Offer Price <span className='text-xs text-green-600 font-normal'>(Optional)</span></label>
                            <input
                                type="number"
                                id='offerPrice'
                                placeholder='eg. 99'
                                className='w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-400 transition-all'
                                onChange={(e) => setOfferPrice(e.target.value)}
                                value={offerPrice}
                            />
                        </div>
                    </div>
                    <div className='flex flex-col sm:flex-row items-center gap-5'>
                        <label htmlFor="image" className='cursor-pointer flex items-center justify-center gap-2 bg-green-50 text-green-700 font-semibold border border-green-200 rounded-xl px-6 py-3 hover:bg-green-100 transition-all w-full sm:w-auto'>
                            <Upload className='w-5 h-5' />   Upload image </label>

                        <input type="file" id='image' accept='image/*' hidden
                            onChange={handleImageChange}

                        />
                        {preview && <Image src={preview} width={100} height={100} alt='image' className='rounded-xl shadow-md border border-gray-200 object-cover' />}
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                        type='submit'
                        className='mt-4 w-full bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-60 transition-all flex items-center justify-center gap-2'
                    >
                        {loading ? <Loader className='w-5 h-5 animate-spin' /> : "Add Grocery"}
                    </motion.button>
                </form>

            </motion.div>
        </div>
    )
}

export default AddGrocery