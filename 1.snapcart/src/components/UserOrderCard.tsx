'use client'

import React, { useEffect, useState } from 'react'
import { motion } from "motion/react"
import { ChevronDown, ChevronUp, CreditCard, MapPin, Package, Truck, UserCheck } from 'lucide-react'
import Image from 'next/image'
import { getSocket } from '@/lib/socket'
import { IUser } from '@/models/user.model'
import { useRouter } from 'next/navigation'

function playNotificationSound() {
    try {
        const ctx = new AudioContext()
        const gain1 = ctx.createGain()
        gain1.gain.setValueAtTime(0.3, ctx.currentTime)
        gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
        gain1.connect(ctx.destination)
        const osc1 = ctx.createOscillator()
        osc1.type = 'sine'
        osc1.frequency.setValueAtTime(880, ctx.currentTime)
        osc1.connect(gain1)
        osc1.start(ctx.currentTime)
        osc1.stop(ctx.currentTime + 0.2)

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

        setTimeout(() => ctx.close(), 1200)
    } catch {
        // AudioContext not available
    }
}
interface IOrder {
    _id?: string
    user:string
    items: [
        {
            grocery: string,
            name: string,
            price: string,
            unit: string,
            image: string
            quantity: number
        }
    ]
    ,
    isPaid: boolean
    totalAmount: number,
    paymentMethod: "cod" | "online"
    address: {
        fullName: string,
        mobile: string,
        city: string,
        state: string,
        pincode: string,
        fullAddress: string,
        latitude: number,
        longitude: number
    }
    assignment?:string
    assignedDeliveryBoy?: IUser
    status: "pending" | "out of delivery" | "delivered",
    createdAt?: Date
    updatedAt?: Date
}
function UserOrderCard({ order }: { order: IOrder }) {
    const [expanded, setExpanded] = useState(false)
    const [status,setStatus]=useState(order.status)
    const [otpAlert, setOtpAlert] = useState(false)
    const router=useRouter()

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission()
        }
    }, [])
    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending":
                return "bg-yellow-100 text-yellow-700 border-yellow-300"
            case "out of delivery":
                return "bg-blue-100 text-blue-700 border-blue-300"
            case "delivered":
                return "bg-green-100 text-green-700 border-green-300"
            default:
                return "bg-gray-100 text-gray-600 border-gray-300"
        }
    }

    useEffect(():any=>{
const socket=getSocket()
socket.on("order-status-update",(data)=>{
    if(data.orderId.toString()==order?._id!.toString()){
        setStatus(data.status)
    }
})
socket.on("otp-requested", (data) => {
    if (data.orderId.toString() === order?._id!.toString()) {
        playNotificationSound()

        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('Delivery Arrived!', {
                body: 'Share the OTP from your email with the delivery person.',
                icon: '/favicon.ico',
            })
        }

        setOtpAlert(true)
        setTimeout(() => setOtpAlert(false), 10000)
    }
})
return ()=>{
    socket.off("order-status-update")
    socket.off("otp-requested")
}
    },[])
    return (
        <>
        {otpAlert && (
            <div className='fixed top-4 right-4 z-[9999] max-w-sm w-full'>
                <motion.div
                    initial={{ opacity: 0, x: 80, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 80 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                    className='bg-white border-2 border-blue-200 rounded-2xl shadow-2xl overflow-hidden'
                >
                    <motion.div
                        className='h-1 bg-blue-500 origin-left'
                        initial={{ scaleX: 1 }}
                        animate={{ scaleX: 0 }}
                        transition={{ duration: 10, ease: 'linear' }}
                    />
                    <div className='flex items-start gap-3 p-4'>
                        <div className='text-2xl flex-shrink-0'>🚚</div>
                        <div className='flex-1 min-w-0'>
                            <p className='font-bold text-gray-800 text-sm'>Your delivery has arrived!</p>
                            <p className='text-gray-500 text-xs mt-0.5'>Check your email for the OTP and share it with the delivery person.</p>
                        </div>
                        <button
                            onClick={() => setOtpAlert(false)}
                            className='text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 flex-shrink-0 text-lg leading-none'
                        >
                            ×
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className='bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden'>
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-gray-100 px-5 py-4 bg-linear-to-r from-green-50 to-white'>
                <div>
                    <h3 className='text-lg font-semibold text-gray-800'>order <span className='text-green-700 font-bold'>#{order?._id?.toString()?.slice(-6)}</span></h3>
                    <p className='text-xs text-gray-500 mt-1'>{new Date(order.createdAt!).toLocaleString()}</p>
                </div>
                <div className='flex flex-wrap items-center gap-2'>
                    {status!=="delivered" && <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${order.isPaid
                        ? "bg-green-100 text-green-700 border-green-300"
                        : "bg-red-100 text-red-700 border-red-300"
                        }`}
                    >
                        {order.isPaid ? "Paid" : "Unpaid"}
                    </span>}
                    
                    <span className={`px-3 py-1 text-xs font-semibold border rounded-full ${getStatusColor(
                       status
                    )}`}
                    >
                        {status}
                    </span>

                </div>
            </div>
           
{status!="delivered" &&  <div className='p-5 space-y-4'>
                {order.paymentMethod == "cod" ? <div className='flex items-center gap-2 text-gray-700 text-sm'>
                    <Truck size={16} className='text-green-600' />
                    Cash On Delivery
                </div> : <div className='flex items-center gap-2 text-gray-700 text-sm'>

                    <CreditCard size={16} className='text-green-600' />
                    Online Payment
                </div>}
                 {order.assignedDeliveryBoy && <><div className='mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between'>
                            <div className='flex items-center gap-3 text-sm text-gray-700'>
                              <UserCheck className="text-blue-600" size={18}/>
                              <div className='font-semibold text-gray-800'>
                                <p className=''>Assigned to : <span>{order.assignedDeliveryBoy.name}</span></p>
                                <p className='text-xs text-gray-600'>📞 +91 {order.assignedDeliveryBoy.mobile}</p>
                              </div>
                            </div>
            
                            <a href={`tel:${order.assignedDeliveryBoy.mobile}`} className='bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700 transition'>Call</a>
                            </div>
                             <button className='w-full flex items-center justify-center gap-2 bg-green-600 text-white font-semibold px-4 py-2 rounded-xl shadow hover:bg-green-700 transition' onClick={()=>router.push(`/user/track-order/${order._id?.toString()}`)}><Truck size={18}/> Track Your Order</button>
                            </> 
                            }

                   


                <div className='flex items-center gap-2 text-gray-700 text-sm'>
                    <MapPin size={16} className="text-green-600" />
                    <span className='truncate'>{order.address.fullAddress}</span>
                </div>

                <div className='border-t border-gray-200 pt-3'>
                    <button
                        onClick={() => setExpanded(prev => !prev)}
                        className='w-full flex justify-between items-center text-sm font-medium text-gray-700 hover:text-green-700 transition'
                    >

                        <span className='flex items-center gap-2'>
                            <Package size={16} className="text-green-600" />
                            {expanded ? "Hide Order Items" : `view ${order.items.length} Items`}
                        </span>

                        {expanded ? <ChevronUp size={16} className="text-green-600" /> : <ChevronDown size={16} className="text-green-600" />}

                    </button>

                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                            height: expanded ? "auto" : 0,
                            opacity: expanded ? 1 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className='mt-3 space-y-3'>
                           {order.items.map((item,index)=>(
                            <div 
                            key={index}
                            className='flex justify-between items-center bg-gray-50 rounded-xl px-3 py-2 hover:bg-gray-100 transition'>
                               <div className='flex items-center gap-3'>
                                     <Image src={item.image} alt={item.name} width={48} height={48} className=" rounded-lg object-cover border border-gray-200"/>
                                     <div>
                                        <p className='text-sm font-medium text-gray-800'>{item.name}</p>
                                        <p className='text-xs text-gray-500'>{item.quantity} x {item.unit}</p>
                                     </div>
                               </div>
                               <p className='text-sm font-semibold text-gray-800'>₹{Number(item.price)*item.quantity}</p>
                               
                            </div>
                           ))}
                        </div>

                    </motion.div>

                </div>

                 <div className='border-t pt-3 flex justify-between items-center text-sm font-semibold text-gray-800'>
                    <div className='flex items-center gap-2 text-gray-700 text-sm'>
                        <Truck size={16} className="text-green-600"/>
                        <span>Delivery: <span className='text-green-700 font-semibold'>{status}</span></span>
                    </div>
                    <div>
                        Total: <span className='text-green-700 font-bold'>₹{order.totalAmount}</span>
                    </div>
                 </div>

            </div>}
           

        </motion.div>
        </>
    )
}

export default UserOrderCard
