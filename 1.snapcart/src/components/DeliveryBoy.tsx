import React from 'react'
import DeliveryBoyDashboard from './DeliveryBoyDashboard'
import { auth } from '@/auth'
import connectDb from '@/lib/db'
import Order from '@/models/order.model'

async function DeliveryBoy() {
  try {
    await connectDb()
    const session = await auth()
    const deliveryBoyId = session?.user?.id

    if (!deliveryBoyId) {
      console.error('[DeliveryBoy] No delivery boy ID in session')
      return <DeliveryBoyDashboard earning={0}/>
    }

    const orders = await Order.find({
      assignedDeliveryBoy: deliveryBoyId,
      deliveryOtpVerification: true
    }).lean()

    const today = new Date().toDateString()
    const todayOrders = orders.filter((o) => {
      if (!o.deliveredAt) return false
      try {
        return new Date(o.deliveredAt).toDateString() === today
      } catch (e) {
        return false
      }
    }).length

    const todaysEarning = todayOrders * 40

    return (
      <DeliveryBoyDashboard earning={todaysEarning}/>
    )
  } catch (error) {
    console.error('[DeliveryBoy] Error:', error)
    return <DeliveryBoyDashboard earning={0}/>
  }
}

export default DeliveryBoy
