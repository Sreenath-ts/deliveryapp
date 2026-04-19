'use client'
import { getSocket } from '@/lib/socket'
import React, { useEffect, useState } from 'react'

function GeoUpdater({userId}:{userId:string}) {
    const [socket, setSocket] = useState<any>(null)
    const [locationError, setLocationError] = useState<string | null>(null)
    const [hasLocation, setHasLocation] = useState(false)
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
      setIsClient(true)
    }, [])

    useEffect(()=>{
      if (!isClient || !userId) return

      // Initialize socket only on client side
      const s = getSocket()
      setSocket(s)

      // Register identity when socket connects
      const emitIdentity = () => {
        if (s.connected) {
          console.log(`[GeoUpdater] Emitting identity for ${userId}`)
          s.emit("identity", userId)
        }
      }

      emitIdentity()
      s.on("connect", emitIdentity)

      return () => {
        s.off("connect", emitIdentity)
      }
    },[userId, isClient])

    useEffect(() => {
      if (!isClient || !userId || !socket) return

      if(typeof navigator === 'undefined' || !navigator.geolocation) {
        setLocationError("Geolocation is not supported")
        return
      }

      // First try to get a quick position (low accuracy, 30s timeout)
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude
          const lon = pos.coords.longitude
          console.log(`[GeoUpdater] Got initial position: ${lat}, ${lon}`)
          socket.emit("update-location", { userId, latitude: lat, longitude: lon })
          setHasLocation(true)
        },
        (err) => {
          console.log("[GeoUpdater] getCurrentPosition error:", err.message)
        },
        { enableHighAccuracy: false, timeout: 30000, maximumAge: 60000 }
      )

      // Then start watching for updates
      const watcher = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude
          const lon = pos.coords.longitude
          if (!hasLocation) {
            console.log(`[GeoUpdater] First location from watch: ${lat}, ${lon}`)
            setHasLocation(true)
          }
          socket.emit("update-location", { userId, latitude: lat, longitude: lon })
        },
        (err) => {
          console.log("[GeoUpdater] watchPosition error:", err.message, "code:", err.code)
          if (err.code === 1) {
            setLocationError("Location permission denied. Please enable location access.")
          } else if (err.code === 2) {
            setLocationError("Location unavailable. Check your device settings.")
          } else if (err.code === 3) {
            setLocationError("Location request timed out. Retrying...")
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const lat = pos.coords.latitude
                const lon = pos.coords.longitude
                console.log(`[GeoUpdater] Retry success: ${lat}, ${lon}`)
                socket.emit("update-location", { userId, latitude: lat, longitude: lon })
                setHasLocation(true)
                setLocationError(null)
              },
              () => setLocationError("Unable to get location. Please check your settings."),
              { enableHighAccuracy: false, timeout: 60000, maximumAge: 300000 }
            )
          }
        },
        { enableHighAccuracy: false, timeout: 60000, maximumAge: 30000 }
      )

      return () => {
        navigator.geolocation.clearWatch(watcher)
      }
    },[userId, socket, hasLocation, isClient])

    if (locationError) {
      console.warn("[GeoUpdater]", locationError)
    }

    return null
}

export default GeoUpdater
