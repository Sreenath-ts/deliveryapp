import React, { useEffect } from 'react'
interface ILocation {
    latitude: number,
    longitude: number
}
interface Iprops {
    userLocation: ILocation
    deliveryBoyLocation: ILocation
}
import L from "leaflet"
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import "leaflet/dist/leaflet.css"

function Recenter({ positions }: { positions: [number, number] }) {
    const map = useMap()
    useEffect(() => {
        if (positions[0] !== 0 && positions[1] !== 0) {
            map.setView(positions, map.getZoom(), {
                animate: true
            })
        }
    }, [positions, map])
    return null
}

function LiveMap({ userLocation, deliveryBoyLocation }: Iprops) {

    const deliveryBoyIcon = L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/128/9561/9561688.png",
        iconSize: [45, 45]
    })
    const userIcon = L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/128/4821/4821951.png",
        iconSize: [45, 45]
    })

    // Only create line if both locations are valid
    const linePositions =
        deliveryBoyLocation && userLocation &&
        deliveryBoyLocation.latitude !== 0 && deliveryBoyLocation.longitude !== 0 &&
        userLocation.latitude !== 0 && userLocation.longitude !== 0
            ? [
                [userLocation.latitude, userLocation.longitude] as [number, number],
                [deliveryBoyLocation.latitude, deliveryBoyLocation.longitude] as [number, number]
            ] : []

    // Use delivery boy location if available, otherwise user location
    const center: [number, number] = 
        deliveryBoyLocation && deliveryBoyLocation.latitude !== 0 && deliveryBoyLocation.longitude !== 0
            ? [deliveryBoyLocation.latitude, deliveryBoyLocation.longitude]
            : [userLocation.latitude, userLocation.longitude]

    return (
        <div className='w-full h-[500px] rounded-xl overflow-hidden shadow-lg relative z-[1]'>
            <MapContainer 
                center={center} 
                zoom={13} 
                scrollWheelZoom={true} 
                className="w-full h-full"
                style={{ zIndex: 1 }}
            >
                <Recenter positions={center} />
                <TileLayer 
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* User location marker */}
                <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon}>
                    <Popup>
                        <div className='text-center'>
                            <p className='font-bold'>Delivery Address</p>
                            <p className='text-sm text-gray-600'>Customer Location</p>
                        </div>
                    </Popup>
                </Marker>

                {/* Delivery boy marker - only show if location is valid */}
                {deliveryBoyLocation && 
                 deliveryBoyLocation.latitude !== 0 && 
                 deliveryBoyLocation.longitude !== 0 && (
                    <Marker 
                        position={[deliveryBoyLocation.latitude, deliveryBoyLocation.longitude]} 
                        icon={deliveryBoyIcon}
                    >
                        <Popup>
                            <div className='text-center'>
                                <p className='font-bold'>Delivery Partner</p>
                                <p className='text-sm text-gray-600'>Current Location</p>
                            </div>
                        </Popup>
                    </Marker>
                )}
                
                {/* Route line - only show if both locations are valid */}
                {linePositions.length > 0 && (
                    <Polyline 
                        positions={linePositions} 
                        color='#10b981'
                        weight={4}
                        opacity={0.7}
                        dashArray="10, 10"
                    />
                )}
            </MapContainer>
        </div>
    )
}

export default LiveMap