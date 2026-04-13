'use client'

import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import GeoUpdater from './GeoUpdater'
import { useEffect, useState } from 'react'

function GlobalGeoUpdater() {
  const { userData } = useSelector((state: RootState) => state.user)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Only render on client side to avoid SSR issues
  if (!isClient) return null

  // Only delivery boys need GeoUpdater on all pages for location tracking
  if (userData?.role === 'deliveryBoy' && userData?._id) {
    return <GeoUpdater userId={userData._id} />
  }

  return null
}

export default GlobalGeoUpdater
