'use client'
import { getSocket } from '@/lib/socket'
import { IDeliveryAssigment } from '@/models/deliveryAssignment.model'
import { RootState } from '@/redux/store'
import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import dynamic from 'next/dynamic'
import DeliveryChat from './DeliveryChat'

// Dynamically import LiveMap to avoid SSR issues with Leaflet
const LiveMap = dynamic(() => import('./LiveMap'), {
  ssr: false,
  loading: () => (
    <div className='w-full h-[500px] rounded-xl bg-gray-100 flex items-center justify-center'>
      <div className='text-center'>
        <Loader className='w-10 h-10 animate-spin text-green-600 mx-auto mb-2' />
        <p className='text-gray-600'>Loading map...</p>
      </div>
    </div>
  )
})
import { Loader, MapPin, Package, TrendingUp, DollarSign, Clock } from 'lucide-react'
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { motion } from 'motion/react'

interface ILocation {
  latitude: number,
  longitude: number
}

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

function DeliveryBoyDashboard({ earning }: { earning: number }) {
  const [assignments, setAssignments] = useState<any[]>([])
  const { userData } = useSelector((state: RootState) => state.user)
  const [activeOrder, setActiveOrder] = useState<any>(null)
  const [showOtpBox, setShowOtpBox] = useState(false)
  const [otpError, setOtpError] = useState("")
  const [sendOtpLoading, setSendOtpLoading] = useState(false)
  const [verifyOtpLoading, setVerifyOtpLoading] = useState(false)
  const [otp, setOtp] = useState("")
  const [locationError, setLocationError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<ILocation | null>(null)
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState<ILocation | null>(null)
  const [mounted, setMounted] = useState(false)
  const [newAssignmentAlert, setNewAssignmentAlert] = useState<{ orderId: string; address: string } | null>(null)
  const alertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const dismissAlert = () => {
    setNewAssignmentAlert(null)
    if (alertTimerRef.current) clearTimeout(alertTimerRef.current)
  }

  const fetchAssignments = async () => {
    try {
      const result = await axios.get("/api/delivery/get-assignments")
      console.log(`[Delivery Dashboard] Fetched ${result.data.length} assignments`, result.data)
      setAssignments(result.data)
    } catch (error) {
      console.log("[Delivery Dashboard] Error fetching assignments:", error)
    }
  }

  useEffect(() => {
    const socket = getSocket()
    if (!userData?._id) return
    
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser")
      return
    }

    // Use lower accuracy to avoid timeout issues
    const watcher = navigator.geolocation.watchPosition((pos) => {
      const lat = pos.coords.latitude
      const lon = pos.coords.longitude
      setDeliveryBoyLocation({
        latitude: lat,
        longitude: lon
      })
      socket.emit("update-location", {
        userId: userData?._id,
        latitude: lat,
        longitude: lon
      })
    }, (err) => {
      console.log("[Dashboard] Geolocation error:", err.message, "code:", err.code)
      if (err.code === 1) {
        setLocationError("Location permission denied. Please enable location access in your browser settings.")
      } else if (err.code === 2) {
        setLocationError("Location unavailable. Please check your device settings.")
      } else if (err.code === 3) {
        setLocationError("Location request timed out. Trying with lower accuracy...")
        // Fallback: try getCurrentPosition with lower accuracy
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude
            const lon = pos.coords.longitude
            setDeliveryBoyLocation({ latitude: lat, longitude: lon })
            socket.emit("update-location", { userId: userData?._id, latitude: lat, longitude: lon })
            setLocationError(null)
          },
          () => setLocationError("Unable to get location. Please allow location access and refresh."),
          { enableHighAccuracy: false, timeout: 60000, maximumAge: 300000 }
        )
      }
    }, { enableHighAccuracy: false, timeout: 60000, maximumAge: 30000 })

    return () => navigator.geolocation.clearWatch(watcher)
  }, [userData?._id])

  useEffect((): any => {
    const socket = getSocket()
    console.log("[Delivery Dashboard] Socket connected, listening for new-assignment")

    socket.on("new-assignment", (deliveryAssignment) => {
      console.log("[Delivery Dashboard] Received new-assignment:", deliveryAssignment)
      setAssignments((prev) => [...prev, deliveryAssignment])

      const shortId = deliveryAssignment.order?._id?.slice(-6) ?? '------'
      const address = deliveryAssignment.order?.address?.fullAddress ?? ''

      playNotificationSound()

      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('New Assignment!', {
          body: `Order #${shortId} — ${address}`,
          icon: '/favicon.ico',
        })
      }

      setNewAssignmentAlert({ orderId: shortId, address })
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current)
      alertTimerRef.current = setTimeout(() => setNewAssignmentAlert(null), 8000)
    })
    return () => socket.off("new-assignment")
  }, [])

  // Polling fallback: fetch assignments every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!activeOrder) {
        fetchAssignments()
      }
    }, 10000)
    return () => clearInterval(interval)
  }, [activeOrder])

  const handleAccept = async (id: string) => {
    try {
      const result = await axios.get(`/api/delivery/assignment/${id}/accept-assignment`)
      fetchCurrentOrder()
      fetchAssignments()
    } catch (error) {
      console.log(error)
    }
  }

  const fetchCurrentOrder = async () => {
    try {
      const result = await axios.get("/api/delivery/current-order")
      if (result.data.active) {
        setActiveOrder(result.data.assignment)
        setUserLocation({
          latitude: result.data.assignment.order.address.latitude,
          longitude: result.data.assignment.order.address.longitude
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect((): any => {
    const socket = getSocket()
    socket.on("update-deliveryBoy-location", ({ userId, location }) => {
      setDeliveryBoyLocation({
        latitude: location.coordinates[1],
        longitude: location.coordinates[0]
      })
    })
    return () => socket.off("update-deliveryBoy-location")
  }, [])

  useEffect(() => {
    fetchCurrentOrder()
    fetchAssignments()
  }, [userData])

  const sendOtp = async () => {
    setSendOtpLoading(true)
    try {
      const result = await axios.post("/api/delivery/otp/send", { orderId: activeOrder.order._id })
      console.log(result.data)
      setShowOtpBox(true)
      setSendOtpLoading(false)
    } catch (error) {
      console.log(error)
      setSendOtpLoading(false)
    }
  }

  const verifyOtp = async () => {
    setVerifyOtpLoading(true)
    setOtpError("")
    try {
      const result = await axios.post("/api/delivery/otp/verify", { orderId: activeOrder.order._id, otp })
      console.log(result.data)
      setActiveOrder(null)
      setVerifyOtpLoading(false)
      await fetchCurrentOrder()
      window.location.reload()
    } catch (error: any) {
      setOtpError(error?.response?.data?.message || "OTP Verification Failed")
      setVerifyOtpLoading(false)
    }
  }

  const assignmentBanner = newAssignmentAlert && (
    <div className='fixed top-4 right-4 z-[9999] max-w-sm w-full pointer-events-auto'>
      <motion.div
        initial={{ opacity: 0, x: 80, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 80 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className='bg-white border-2 border-green-200 rounded-2xl shadow-2xl overflow-hidden'
      >
        <motion.div
          className='h-1 bg-green-500 origin-left'
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: 8, ease: 'linear' }}
        />
        <div className='flex items-start gap-3 p-4'>
          <div className='bg-green-100 p-2 rounded-xl flex-shrink-0 text-lg'>📦</div>
          <div className='flex-1 min-w-0'>
            <p className='font-bold text-gray-800 text-sm'>New delivery assignment!</p>
            <p className='text-gray-500 text-xs mt-0.5 truncate'>Order #{newAssignmentAlert.orderId}</p>
            {newAssignmentAlert.address && (
              <p className='text-gray-400 text-xs mt-0.5 truncate'>{newAssignmentAlert.address}</p>
            )}
          </div>
          <button
            onClick={dismissAlert}
            className='text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 flex-shrink-0 text-lg leading-none'
          >
            ×
          </button>
        </div>
      </motion.div>
    </div>
  )

  // No active deliveries screen
  if (!activeOrder && assignments.length === 0) {
    const todayEarning = [
      {
        name: "Today",
        earning,
        deliveries: Math.floor(earning / 40)
      }
    ]

    return (
      <>
        {assignmentBanner}
      <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-white via-green-50 to-emerald-50 p-6'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='max-w-2xl w-full'
        >
          {/* Header */}
          <div className='text-center mb-8'>
            <div className='inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-4 shadow-lg'>
              <Package className='w-10 h-10 text-white' />
            </div>
            <h2 className='text-3xl font-bold text-gray-800 mb-2'>No Active Deliveries 🚛</h2>
            <p className='text-gray-600'>Stay online to receive new orders</p>
          </div>

          {/* Location Status Alert */}
          {locationError ? (
            <div className='bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6'>
              <div className='flex items-start gap-3'>
                <div className='p-2 bg-red-100 rounded-lg'>
                  <MapPin className='w-5 h-5 text-red-600' />
                </div>
                <div className='flex-1'>
                  <h3 className='font-bold text-red-800 mb-1'>Location Access Required</h3>
                  <p className='text-sm text-red-700 mb-3'>{locationError}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors'
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Connection Status Card */
            <div className='bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-6'>
              <div className='flex items-start gap-3'>
                <div className='p-2 bg-blue-100 rounded-lg'>
                  <MapPin className='w-5 h-5 text-blue-600' />
                </div>
                <div className='flex-1'>
                  <h3 className='font-bold text-blue-800 mb-1'>Online & Waiting</h3>
                  <p className='text-sm text-blue-700'>
                    {deliveryBoyLocation 
                      ? `Location active: ${deliveryBoyLocation.latitude.toFixed(4)}, ${deliveryBoyLocation.longitude.toFixed(4)}`
                      : "Getting your location..."
                    }
                  </p>
                  <p className='text-xs text-blue-600 mt-1'>
                    Socket: {mounted ? (getSocket().connected ? 'Connected' : 'Disconnected') : '...'} | 
                    Polling: Active (10s)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6'>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className='bg-white border-2 border-green-100 rounded-2xl shadow-lg p-6'
            >
              <div className='flex items-center gap-3 mb-2'>
                <div className='p-2 bg-green-100 rounded-xl'>
                  <DollarSign className='w-6 h-6 text-green-600' />
                </div>
                <h3 className='font-semibold text-gray-700'>Today's Earnings</h3>
              </div>
              <p className='text-3xl font-bold text-green-600'>₹{earning || 0}</p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              className='bg-white border-2 border-blue-100 rounded-2xl shadow-lg p-6'
            >
              <div className='flex items-center gap-3 mb-2'>
                <div className='p-2 bg-blue-100 rounded-xl'>
                  <TrendingUp className='w-6 h-6 text-blue-600' />
                </div>
                <h3 className='font-semibold text-gray-700'>Deliveries</h3>
              </div>
              <p className='text-3xl font-bold text-blue-600'>{Math.floor(earning / 40)}</p>
            </motion.div>
          </div>

          {/* Performance Chart */}
          <div className='bg-white border-2 border-gray-100 rounded-2xl shadow-xl p-6'>
            <h3 className='font-bold text-gray-800 mb-4 flex items-center gap-2'>
              <TrendingUp className='w-5 h-5 text-green-600' />
              Today's Performance
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={todayEarning}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="earning" name="Earnings (₹)" fill="#10b981" />
                <Bar dataKey="deliveries" name="Deliveries" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>

            <button 
              className='mt-6 w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2'
              onClick={() => window.location.reload()}
            >
              <TrendingUp className='w-5 h-5' />
              Refresh Dashboard
            </button>
          </div>
        </motion.div>
      </div>
      </>
    )
  }

  // Active delivery screen
  if (activeOrder && userLocation && deliveryBoyLocation) {
    return (
      <>
        {assignmentBanner}
      <div className='p-4 pt-[120px] min-h-screen bg-gradient-to-br from-gray-50 to-green-50'>
        <div className='max-w-4xl mx-auto'>
          {/* Header */}
          <div className='bg-white rounded-2xl shadow-lg border-2 border-green-100 p-6 mb-6'>
            <div className='flex items-center justify-between mb-2'>
              <h1 className='text-2xl font-bold text-gray-800 flex items-center gap-2'>
                <Package className='w-7 h-7 text-green-600' />
                Active Delivery
              </h1>
              <span className='bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold'>
                In Progress
              </span>
            </div>
            <p className='text-gray-600 flex items-center gap-2'>
              <MapPin className='w-4 h-4' />
              Order #{activeOrder.order._id.slice(-6)}
            </p>
          </div>

          {/* Map */}
          <div className='rounded-2xl border-2 border-gray-200 shadow-2xl overflow-hidden mb-6'>
            <LiveMap userLocation={userLocation} deliveryBoyLocation={deliveryBoyLocation} />
          </div>

          {/* Chat */}
          <div className='mb-6'>
            <DeliveryChat orderId={activeOrder.order._id} deliveryBoyId={userData?._id?.toString()!} />
          </div>

          {/* OTP Section */}
          <div className='bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-6'>
            {!activeOrder.order.deliveryOtpVerification && !showOtpBox && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={sendOtp}
                disabled={sendOtpLoading}
                className='w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60'
              >
                {sendOtpLoading ? (
                  <Loader size={20} className='animate-spin' />
                ) : (
                  <>
                    <Package className='w-5 h-5' />
                    Mark as Delivered
                  </>
                )}
              </motion.button>
            )}
            
            {showOtpBox && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className='space-y-4'
              >
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Enter OTP sent to customer
                  </label>
                  <input
                    type="text"
                    className='w-full py-3 px-4 border-2 border-gray-300 rounded-xl text-center text-2xl font-bold tracking-widest focus:border-green-400 focus:ring-4 focus:ring-green-100 outline-none transition-all'
                    placeholder='0000'
                    maxLength={4}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    value={otp}
                  />
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className='w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60'
                  onClick={verifyOtp}
                  disabled={verifyOtpLoading || otp.length !== 4}
                >
                  {verifyOtpLoading ? (
                    <Loader size={20} className='animate-spin' />
                  ) : (
                    'Verify OTP'
                  )}
                </motion.button>
                
                {otpError && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className='bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-center font-semibold'
                  >
                    {otpError}
                  </motion.div>
                )}
              </motion.div>
            )}
            
            {activeOrder.order.deliveryOtpVerification && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className='text-center py-4'
              >
                <div className='inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3'>
                  <Package className='w-8 h-8 text-green-600' />
                </div>
                <p className='text-green-700 font-bold text-xl'>Delivery Completed! 🎉</p>
                <p className='text-gray-600 mt-1'>Great job! The order has been successfully delivered.</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      </>
    )
  }

  // Pending assignments screen
  return (
    <>
      {assignmentBanner}
      <div className='w-full min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-4'>
      <div className="max-w-4xl mx-auto pt-[120px]">
        <div className='mb-8'>
          <h2 className='text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3'>
            <Clock className='w-8 h-8 text-green-600' />
            Pending Assignments
          </h2>
          <p className='text-gray-600'>Accept an order to start delivery</p>
        </div>

        {locationError && (
          <div className='bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6'>
            <p className='text-yellow-800 font-semibold flex items-center gap-2'>
              <MapPin className='w-5 h-5' />
              {locationError}
            </p>
          </div>
        )}

        <div className='space-y-4'>
          {assignments.map((a, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className='bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 hover:shadow-xl hover:border-green-200 transition-all'
            >
              <div className='flex items-start justify-between mb-4'>
                <div>
                  <p className='text-sm text-gray-500 mb-1'>Order ID</p>
                  <p className='text-xl font-bold text-gray-800'>#{a?.order._id.slice(-6)}</p>
                </div>
                <div className='bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold'>
                  New Order
                </div>
              </div>
              
              <div className='flex items-start gap-2 mb-4'>
                <MapPin className='w-5 h-5 text-gray-400 mt-0.5' />
                <p className='text-gray-700'>{a.order.address.fullAddress}</p>
              </div>

              <div className='flex gap-3'>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className='flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all'
                  onClick={() => handleAccept(a._id)}
                >
                  Accept Order
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className='flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-3 rounded-xl font-bold transition-all'
                >
                  Reject
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
    </>
  )
}

export default DeliveryBoyDashboard