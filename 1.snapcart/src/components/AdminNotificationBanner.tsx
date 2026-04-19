'use client'

import { getSocket } from '@/lib/socket'
import { registerPushSubscription } from '@/lib/registerPushSubscription'
import { RootState } from '@/redux/store'
import { AnimatePresence, motion } from 'motion/react'
import { ShoppingCart, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

interface OrderNotification {
    id: string
    orderId: string
    amount: number
}

function playNotificationSound() {
    try {
        const ctx = new AudioContext()

        const gainNode = ctx.createGain()
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
        gainNode.connect(ctx.destination)

        // First tone — higher pitch
        const osc1 = ctx.createOscillator()
        osc1.type = 'sine'
        osc1.frequency.setValueAtTime(880, ctx.currentTime)
        osc1.connect(gainNode)
        osc1.start(ctx.currentTime)
        osc1.stop(ctx.currentTime + 0.2)

        // Second tone — lower pitch, slightly delayed
        const gain2 = ctx.createGain()
        gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.2)
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0)
        gain2.connect(ctx.destination)

        const osc2 = ctx.createOscillator()
        osc2.type = 'sine'
        osc2.frequency.setValueAtTime(660, ctx.currentTime + 0.2)
        osc2.connect(gain2)
        osc2.start(ctx.currentTime + 0.2)
        osc2.stop(ctx.currentTime + 0.55)

        // Cleanup after tones finish
        setTimeout(() => ctx.close(), 1200)
    } catch {
        // AudioContext not available — silently skip
    }
}

function AdminNotificationBanner() {
    const userData = useSelector((state: RootState) => state.user.userData)
    const [notifications, setNotifications] = useState<OrderNotification[]>([])
    const timerRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

    useEffect(() => {
        if (userData?.role !== 'admin') return

        registerPushSubscription()

        const socket = getSocket()

        const handleNewOrder = (order: { _id: string; totalAmount: number }) => {
            const notifId = `${order._id}-${Date.now()}`
            const shortId = order._id?.slice(-6).toUpperCase() ?? '------'

            // 1. Play chime
            playNotificationSound()

            // 2. Browser push notification
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                const notif = new Notification('New Order Received!', {
                    body: `Order #${shortId} — ₹${order.totalAmount ?? 0}. Tap to view.`,
                    icon: '/favicon.ico',
                    tag: notifId,
                })
                notif.onclick = () => {
                    window.focus()
                    notif.close()
                }
            }

            // 3. In-app banner
            const newEntry: OrderNotification = {
                id: notifId,
                orderId: shortId,
                amount: order.totalAmount ?? 0,
            }
            setNotifications(prev => [newEntry, ...prev])

            // Auto-dismiss after 8 seconds
            const timer = setTimeout(() => dismiss(notifId), 8000)
            timerRefs.current.set(notifId, timer)
        }

        socket.on('new-order', handleNewOrder)
        return () => {
            socket.off('new-order', handleNewOrder)
        }
    }, [userData])

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            timerRefs.current.forEach(t => clearTimeout(t))
        }
    }, [])

    const dismiss = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id))
        const timer = timerRefs.current.get(id)
        if (timer) {
            clearTimeout(timer)
            timerRefs.current.delete(id)
        }
    }

    if (userData?.role !== 'admin') return null

    return (
        <div className='fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none'>
            <AnimatePresence>
                {notifications.map(n => (
                    <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: 80, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 80, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        className='pointer-events-auto bg-white border-2 border-green-200 rounded-2xl shadow-2xl overflow-hidden'
                    >
                        {/* Progress bar auto-dismiss indicator */}
                        <motion.div
                            className='h-1 bg-green-500 origin-left'
                            initial={{ scaleX: 1 }}
                            animate={{ scaleX: 0 }}
                            transition={{ duration: 8, ease: 'linear' }}
                        />

                        <div className='flex items-start gap-3 p-4'>
                            <div className='bg-green-100 p-2 rounded-xl flex-shrink-0'>
                                <ShoppingCart className='w-5 h-5 text-green-600' />
                            </div>
                            <div className='flex-1 min-w-0'>
                                <p className='font-bold text-gray-800 text-sm'>New Order Received!</p>
                                <p className='text-gray-500 text-xs mt-0.5 truncate'>
                                    Order #{n.orderId} — ₹{n.amount}
                                </p>
                                <Link
                                    href='/admin/manage-orders'
                                    className='inline-flex items-center gap-1 mt-2 text-xs font-semibold text-green-600 hover:text-green-700 hover:underline transition-colors'
                                    onClick={() => dismiss(n.id)}
                                >
                                    View Orders →
                                </Link>
                            </div>
                            <button
                                onClick={() => dismiss(n.id)}
                                className='text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 flex-shrink-0'
                            >
                                <X className='w-4 h-4' />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}

export default AdminNotificationBanner
