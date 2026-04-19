'use client'
import { Boxes, ClipboardCheck, Cross, LogOut, Menu, Package, Plus, PlusCircle, Search, ShoppingCartIcon, User, X, Image as ImageIcon, Tag } from 'lucide-react'

import Link from 'next/link'
import React, { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'motion/react'
import { signOut } from 'next-auth/react'
import { createPortal } from 'react-dom'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { useRouter, useSearchParams } from 'next/navigation'

interface IUser {
    _id?: string
    name: string
    email: string
    password?: string
    mobile?: string
    role: "user" | "deliveryBoy" | "admin"
    image?: string
}
function Nav({ user }: { user: IUser }) {
    const [open, setOpen] = useState(false)
    const profileDropDown = useRef<HTMLDivElement>(null)
    const [searchBarOpen, setSearchBarOpen] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const { cartData } = useSelector((state: RootState) => state.cart)
    const [search, setSearch] = useState("")
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [groceries, setGroceries] = useState<{ name: string; category: string }[]>([])
    const searchContainerRef = useRef<HTMLDivElement>(null)
    const mobileSearchContainerRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    const searchParams = useSearchParams()

    // Keep the search input in sync with the ?q= URL param
    useEffect(() => {
        const q = searchParams.get('q')
        setSearch(q ?? "")
    }, [searchParams])

    // Fetch groceries once for suggestions (user role only)
    useEffect(() => {
        if (user.role !== 'user') return
        fetch('/api/admin/get-groceries')
            .then(r => r.json())
            .then(data => setGroceries(Array.isArray(data) ? data : []))
            .catch(() => {})
    }, [user.role])

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (profileDropDown.current && !profileDropDown.current.contains(e.target as Node)) {
                setOpen(false)
            }
            // Close suggestions when clicking outside both search containers
            const target = e.target as Node
            const inDesktop = searchContainerRef.current?.contains(target)
            const inMobile = mobileSearchContainerRef.current?.contains(target)
            if (!inDesktop && !inMobile) setShowSuggestions(false)
        }
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setShowSuggestions(false)
        }
        document.addEventListener("mousedown", handleClickOutside)
        document.addEventListener("keydown", handleKeyDown)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
            document.removeEventListener("keydown", handleKeyDown)
        }
    }, [])

    const filteredSuggestions = useMemo(() => {
        if (!search.trim()) return []
        const q = search.toLowerCase()
        const seen = new Set<string>()
        const results: string[] = []
        for (const g of groceries) {
            if (results.length >= 6) break
            if (g.name.toLowerCase().includes(q) && !seen.has(g.name)) {
                seen.add(g.name)
                results.push(g.name)
            } else if (g.category.toLowerCase().includes(q) && !seen.has(g.category)) {
                seen.add(g.category)
                results.push(g.category)
            }
        }
        return results
    }, [search, groceries])

    const handleSearch = (e: FormEvent) => {
        e.preventDefault()
        const query = search.trim()
        setShowSuggestions(false)
        if (!query) {
            return router.push("/")
        }
        router.push(`/?q=${encodeURIComponent(query)}`)
        setSearchBarOpen(false)
    }

    const handleSuggestionClick = (value: string) => {
        setSearch(value)
        setShowSuggestions(false)
        router.push(`/?q=${encodeURIComponent(value)}`)
        setSearchBarOpen(false)
    }

    const clearSearch = () => {
        setSearch("")
        setShowSuggestions(false)
        router.push("/")
        setSearchBarOpen(false)
    }

    const sideBar = menuOpen ? createPortal(
        <AnimatePresence>
            <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100 }}
                transition={{ type: "spring", stiffness: 100, damping: 14 }}
                className='fixed top-0 left-0 h-full w-[75%] sm:w-[60%] z-[9999]
              bg-gradient-to-b from-green-800/90 via-green-700/80 to-green-900/90
              backdrop-blur-xl border-r border-green-400/20
              shadow-[0_0_50px_-10px_rgba(0,255,100,0.3)]
              flex flex-col p-6 text-white'
            >
                <div className='flex justify-between items-center mb-2'>
                    <h1 className='font-extrabold text-2xl tracking-wide text-white/90'>Admin Panel</h1>
                    <button className='text-white/80 hover:text-red-400 text-2xl font-bold transition'
                        onClick={() => setMenuOpen(false)}
                    ><X /></button>
                </div>
                <div className='flex items-center gap-3 p-3 mt-3 rounded-xl bg-white/10 hover:bg-white/15 transition-all shadow-inner'>
                    <div className='relative w-12 h-12 rounded-full overflow-hidden border-2 border-green-400/60 shadow-lg'> 
                        {user.image ? <Image src={user.image} alt='user' fill className='object-cover rounded-full' /> : <User />}
                    </div>
                    <div >
                        <h2 className='text-lg font-semibold text-white'>{user.name}</h2>
                        <p className='text-xs text-green-200 capitalize tracking-wide'>{user.role}</p>
                    </div>
                </div>
                <div className='flex flex-col gap-3 font-medium mt-6 overflow-y-auto flex-1'>
                    <Link 
                        href={"/admin/add-grocery"} 
                        className='flex items-center gap-3 p-3 rounded-lg bg-white/10 hover:bg-white/20 hover:pl-4 transition-all'
                        onClick={() => setMenuOpen(false)}
                    >
                        <PlusCircle className='w-5 h-5' /> Add Grocery
                    </Link>
                    <Link 
                        href={"/admin/view-grocery"} 
                        className='flex items-center gap-3 p-3 rounded-lg bg-white/10 hover:bg-white/20 hover:pl-4 transition-all'
                        onClick={() => setMenuOpen(false)}
                    >
                        <Boxes className='w-5 h-5' /> View Grocery
                    </Link>
                    <Link 
                        href={"/admin/manage-orders"} 
                        className='flex items-center gap-3 p-3 rounded-lg bg-white/10 hover:bg-white/20 hover:pl-4 transition-all'
                        onClick={() => setMenuOpen(false)}
                    >
                        <ClipboardCheck className='w-5 h-5' /> Manage Orders
                    </Link>
                    <Link
                        href={"/admin/manage-banners"}
                        className='flex items-center gap-3 p-3 rounded-lg bg-white/10 hover:bg-white/20 hover:pl-4 transition-all'
                        onClick={() => setMenuOpen(false)}
                    >
                        <ImageIcon className='w-5 h-5' /> Manage Banners
                    </Link>
                    <Link
                        href={"/admin/manage-categories"}
                        className='flex items-center gap-3 p-3 rounded-lg bg-white/10 hover:bg-white/20 hover:pl-4 transition-all'
                        onClick={() => setMenuOpen(false)}
                    >
                        <Tag className='w-5 h-5' /> Manage Categories
                    </Link>
                </div>
                <div className='my-5 border-t border-white/20'></div>
                <div className='flex items-center gap-3 text-red-300 font-semibold mt-auto hover:bg-red-500/20 p-3 rounded-lg transition-all cursor-pointer' onClick={async () => await signOut({ callbackUrl: "/" })}>
                    <LogOut className='w-5 h-5 text-red-300' />
                    Logout
                </div>
            </motion.div>
        </AnimatePresence>,
        document.body
    ) : null


    return (
        <div className='w-[95%] fixed top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-green-700 rounded-2xl shadow-lg shadow-black/30 flex justify-between items-center h-20 px-4 md:px-8 z-50'>

            <Link href={"/"} className='text-white font-extrabold text-2xl sm:text-3xl tracking-wide hover:scale-105 transition-transform'>
                Snapcart
            </Link>
            {user.role == "user" && (
                <div ref={searchContainerRef} className='hidden md:block relative w-1/2 max-w-lg'>
                    <form className='flex items-center bg-white rounded-full px-4 py-2 shadow-md' onSubmit={handleSearch}>
                        <Search className='text-gray-500 w-5 h-5 mr-2 flex-shrink-0' />
                        <input
                            type="text"
                            placeholder='Search groceries...'
                            className='w-full outline-none text-gray-700 placeholder-gray-400'
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true) }}
                            onFocus={() => { if (search.trim()) setShowSuggestions(true) }}
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className='flex-shrink-0 ml-1 w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 hover:bg-red-100 hover:text-red-600 text-gray-500 transition-all'
                                aria-label="Clear search"
                            >
                                <X className='w-3.5 h-3.5' />
                            </button>
                        )}
                    </form>
                    {showSuggestions && filteredSuggestions.length > 0 && (
                        <div className='absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50'>
                            {filteredSuggestions.map((s, i) => (
                                <button
                                    key={i}
                                    type='button'
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => handleSuggestionClick(s)}
                                    className='flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors'
                                >
                                    <Search className='w-3.5 h-3.5 text-gray-400 flex-shrink-0' />
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}


            <div className='flex items-center gap-3 md:gap-6 relative'>

                {user.role == "user" && <> <div className='bg-white rounded-full w-11 h-11 flex items-center justify-center shadow-md hover:scale-105 transition md:hidden' onClick={() => setSearchBarOpen((prev) => !prev)}>
                    <Search className='text-green-600 w-6 h-6' />
                </div>



                    <Link href={"/user/cart"} className='relative bg-white rounded-full w-11 h-11 flex items-center justify-center shadow-md hover:scale-105 transition'>
                        <ShoppingCartIcon className='text-green-600 w-6 h-6' />
                        <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-semibold shadow'>{cartData.length}</span>
                    </Link></>}

                {user.role == "admin" && <>
                    <div className='hidden lg:flex items-center gap-3'>
                        <Link href={"/admin/add-grocery"} className='flex items-center gap-2 bg-white text-green-700 font-semibold px-4 py-2 rounded-full hover:bg-green-100 transition-all shadow-md'>
                            <PlusCircle className='w-4 h-4' /> Add Grocery
                        </Link>
                        <Link href={"/admin/view-grocery"} className='flex items-center gap-2 bg-white text-green-700 font-semibold px-4 py-2 rounded-full hover:bg-green-100 transition-all shadow-md'>
                            <Boxes className='w-4 h-4' /> View Grocery
                        </Link>
                        <Link href={"/admin/manage-orders"} className='flex items-center gap-2 bg-white text-green-700 font-semibold px-4 py-2 rounded-full hover:bg-green-100 transition-all shadow-md'>
                            <ClipboardCheck className='w-4 h-4' /> Manage Orders
                        </Link>
                        <Link href={"/admin/manage-banners"} className='flex items-center gap-2 bg-white text-green-700 font-semibold px-4 py-2 rounded-full hover:bg-green-100 transition-all shadow-md'>
                            <ImageIcon className='w-4 h-4' /> Banners
                        </Link>
                        <Link href={"/admin/manage-categories"} className='flex items-center gap-2 bg-white text-green-700 font-semibold px-4 py-2 rounded-full hover:bg-green-100 transition-all shadow-md'>
                            <Tag className='w-4 h-4' /> Categories
                        </Link>
                    </div>
                    <div className='lg:hidden bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:scale-105 transition cursor-pointer' onClick={() => setMenuOpen(prev => !prev)}>
                        <Menu className='text-green-600 w-6 h-6' />
                    </div>
                </>}



                <div className='relative' ref={profileDropDown}>
                    <div className='bg-white rounded-full w-11 h-11 flex items-center justify-center overflow-hidden shadow-md hover:scale-105 transition-transform cursor-pointer' onClick={() => setOpen(prev => !prev)}>
                        {user.image ? <Image src={user.image} alt='user' fill className='object-cover rounded-full' /> : <User className='text-green-600' />}
                    </div>
                    <AnimatePresence>
                        {open &&

                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.4 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className='absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 p-3 z-[999]'
                            >
                                <div className='flex items-center gap-3 px-3 py-2 border-b border-gray-100'>
                                    <div className='w-10 h-10 relative rounded-full bg-green-100 flex items-center justify-center overflow-hidden'>
                                        {user.image ? <Image src={user.image} alt='user' fill className='object-cover rounded-full' /> : <User className='text-green-600' />}
                                    </div>
                                    <div>
                                        <div className='text-gray-800 font-semibold'>{user.name}</div>
                                        <div className='text-xs text-gray-500 capitalize'>{user.role}</div>
                                    </div>
                                </div>
                                {user.role == "user" && <Link href={"/user/my-orders"} className='flex items-center gap-2 px-3 py-3 hover:bg-green-50 rounded-lg text-gray-700 font-medium' onClick={() => setOpen(false)}>
                                    <Package className='w-5 h-5 text-green-600' />
                                    My Orders
                                </Link>}

                                <button className='flex items-center gap-2 w-full text-left px-3 py-3 hover:bg-red-50 rounded-lg text-gray-700 font-medium' onClick={() => {
                                    setOpen(false)
                                    signOut({ callbackUrl: "/login" })
                                }}>
                                    <LogOut className='w-5 h-5 text-red-600' />
                                    Log Out

                                </button>
                            </motion.div>
                        }
                    </AnimatePresence>

                    <AnimatePresence>
                        {searchBarOpen && (
                            <motion.div
                                ref={mobileSearchContainerRef}
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.4 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className={`fixed top-24 left-1/2 -translate-x-1/2 w-[90%] bg-white shadow-lg z-40 overflow-hidden ${showSuggestions && filteredSuggestions.length > 0 ? 'rounded-2xl' : 'rounded-full'}`}
                            >
                                <div className='flex items-center px-4 py-2'>
                                    <Search className='text-gray-500 w-5 h-5 mr-2 flex-shrink-0' />
                                    <form className='grow' onSubmit={handleSearch}>
                                        <input
                                            type="text"
                                            className='w-full outline-none text-gray-700'
                                            placeholder='Search groceries...'
                                            value={search}
                                            onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true) }}
                                            onFocus={() => { if (search.trim()) setShowSuggestions(true) }}
                                            autoFocus
                                        />
                                    </form>
                                    {search ? (
                                        <button
                                            type="button"
                                            onClick={clearSearch}
                                            className='flex-shrink-0 ml-1 w-7 h-7 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-all'
                                            aria-label="Clear search"
                                        >
                                            <X className='w-4 h-4' />
                                        </button>
                                    ) : (
                                        <button type="button" onClick={() => setSearchBarOpen(false)} className='flex-shrink-0 ml-1'>
                                            <X className='text-gray-500 w-5 h-5' />
                                        </button>
                                    )}
                                </div>
                                {showSuggestions && filteredSuggestions.length > 0 && (
                                    <div className='border-t border-gray-100'>
                                        {filteredSuggestions.map((s, i) => (
                                            <button
                                                key={i}
                                                type='button'
                                                onMouseDown={(e) => e.preventDefault()}
                                                onClick={() => handleSuggestionClick(s)}
                                                className='flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors'
                                            >
                                                <Search className='w-3.5 h-3.5 text-gray-400 flex-shrink-0' />
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>


                </div>
            </div>
            {sideBar}
        </div>
    )
}

export default Nav