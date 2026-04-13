'use client'

import React, { useEffect, useState } from 'react'
import { motion } from "motion/react"
import {
    AlertCircle,
    ArrowLeft,
    Building,
    CreditCard,
    CreditCardIcon,
    Home,
    Loader2,
    LocateFixed,
    MapPin,
    Navigation,
    Phone,
    Search,
    Truck,
    User,
    CheckCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import axios from 'axios'
import dynamic from 'next/dynamic'

const CheckOutMap = dynamic(() => import("@/components/CheckoutMap"), { ssr: false })

declare global {
    interface Window {
        Razorpay: any
    }
}

function Checkout() {
    const router = useRouter()
    const { userData } = useSelector((state: RootState) => state.user)
    const { subTotal, deliveryFee, finalTotal, cartData } = useSelector((state: RootState) => state.cart)

    const [address, setAddress] = useState({
        fullName: "",
        mobile: "",
        city: "",
        state: "",
        pincode: "",
        fullAddress: ""
    })

    const [searchLoading, setSearchLoading] = useState(false)
    const [orderLoading, setOrderLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [position, setPosition] = useState<[number, number] | null>(null)
    const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod")
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})
    const [hasSearched, setHasSearched] = useState(false)

    const validateField = (fieldName: string, value: string) => {
        const errors = { ...formErrors }

        switch (fieldName) {
            case 'fullName':
                if (!value.trim()) {
                    errors.fullName = "Full name is required"
                } else if (value.trim().length < 3) {
                    errors.fullName = "Name must be at least 3 characters"
                } else {
                    delete errors.fullName
                }
                break

            case 'mobile':
                if (!value.trim()) {
                    errors.mobile = "Mobile number is required"
                } else if (!/^[6-9]\d{9}$/.test(value.trim())) {
                    errors.mobile = "Enter a valid 10-digit mobile number"
                } else {
                    delete errors.mobile
                }
                break

            case 'fullAddress':
                if (!value.trim()) {
                    errors.fullAddress = "Full address is required"
                } else if (value.trim().length < 10) {
                    errors.fullAddress = "Address must be at least 10 characters"
                } else {
                    delete errors.fullAddress
                }
                break

            case 'city':
                if (!value.trim()) {
                    errors.city = "City is required"
                } else {
                    delete errors.city
                }
                break

            case 'state':
                if (!value.trim()) {
                    errors.state = "State is required"
                } else {
                    delete errors.state
                }
                break

            case 'pincode':
                if (!value.trim()) {
                    errors.pincode = "Pincode is required"
                } else if (!/^\d{6}$/.test(value.trim())) {
                    errors.pincode = "Enter a valid 6-digit pincode"
                } else {
                    delete errors.pincode
                }
                break
        }

        setFormErrors(errors)
    }

    const validateForm = () => {
        const errors: Record<string, string> = {}

        if (!address.fullName.trim()) {
            errors.fullName = "Full name is required"
        } else if (address.fullName.trim().length < 3) {
            errors.fullName = "Name must be at least 3 characters"
        }

        if (!address.mobile.trim()) {
            errors.mobile = "Mobile number is required"
        } else if (!/^[6-9]\d{9}$/.test(address.mobile.trim())) {
            errors.mobile = "Enter a valid 10-digit mobile number starting with 6-9"
        }

        if (!address.fullAddress.trim()) {
            errors.fullAddress = "Full address is required"
        } else if (address.fullAddress.trim().length < 10) {
            errors.fullAddress = "Address must be at least 10 characters"
        }

        if (!address.city.trim()) {
            errors.city = "City is required"
        }

        if (!address.state.trim()) {
            errors.state = "State is required"
        }

        if (!address.pincode.trim()) {
            errors.pincode = "Pincode is required"
        } else if (!/^\d{6}$/.test(address.pincode.trim())) {
            errors.pincode = "Enter a valid 6-digit pincode"
        }

        if (!hasSearched || !searchQuery.trim()) {
            errors.searchQuery = "Please search for your location"
        }

        if (!position) {
            errors.location = "Please select your location on the map"
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords
                    setPosition([latitude, longitude])
                },
                (err) => {
                    console.log('Location error:', err)
                },
                { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
            )
        }
    }, [])

    useEffect(() => {
        if (userData) {
            setAddress((prev) => ({
                ...prev,
                fullName: userData?.name || "",
                mobile: userData?.mobile || ""
            }))
        }
    }, [userData])

    const handleSearchQuery = async () => {
        if (!searchQuery.trim()) {
            setFormErrors(prev => ({ ...prev, searchQuery: "Please enter a city or area to search" }))
            return
        }

        setSearchLoading(true)
        setFormErrors(prev => {
            const { location, searchQuery, ...rest } = prev
            return rest
        })

        try {
            const { OpenStreetMapProvider } = await import("leaflet-geosearch")
            const provider = new OpenStreetMapProvider()
            const results = await provider.search({ query: searchQuery })

            if (results && Array.isArray(results) && results.length > 0 && results[0]) {
                setPosition([results[0].y, results[0].x])
                setHasSearched(true)
                setFormErrors(prev => {
                    const { location, searchQuery, ...rest } = prev
                    return rest
                })
            } else {
                setFormErrors(prev => ({
                    ...prev,
                    searchQuery: "No results found. Please try a different search term."
                }))
            }
        } catch (error) {
            console.error("Search error:", error)
            setFormErrors(prev => ({
                ...prev,
                searchQuery: "Search failed. Please check your connection and try again."
            }))
        } finally {
            setSearchLoading(false)
        }
    }

    useEffect(() => {
        const fetchAddress = async () => {
            if (!position) return

            try {
                const result = await axios.get(
                    `https://nominatim.openstreetmap.org/reverse?lat=${position[0]}&lon=${position[1]}&format=json`
                )

                setAddress(prev => ({
                    ...prev,
                    city: result.data.address.city || result.data.address.town || result.data.address.village || "",
                    state: result.data.address.state || "",
                    pincode: result.data.address.postcode || "",
                    fullAddress: result.data.display_name || ""
                }))

                setFormErrors(prev => {
                    const { location, ...rest } = prev
                    return rest
                })
            } catch (error) {
                console.log(error)
            }
        }

        fetchAddress()
    }, [position])

    const loadRazorpayScript = () => {
        return new Promise<boolean>((resolve) => {
            const existingScript = document.getElementById("razorpay-checkout-script")
            if (existingScript) {
                resolve(true)
                return
            }

            const script = document.createElement("script")
            script.id = "razorpay-checkout-script"
            script.src = "https://checkout.razorpay.com/v1/checkout.js"
            script.onload = () => resolve(true)
            script.onerror = () => resolve(false)
            document.body.appendChild(script)
        })
    }

    const handleCod = async () => {
        if (!validateForm()) {
            window.scrollTo({ top: 0, behavior: 'smooth' })
            return
        }

        setOrderLoading(true)

        try {
            await axios.post("/api/user/order", {
                userId: userData?._id,
                items: cartData.map(item => ({
                    grocery: item._id,
                    name: item.name,
                    price: item.price,
                    unit: item.unit,
                    quantity: item.quantity,
                    image: item.image
                })),
                totalAmount: finalTotal,
                address: {
                    fullName: address.fullName.trim(),
                    mobile: address.mobile.trim(),
                    city: address.city.trim(),
                    state: address.state.trim(),
                    fullAddress: address.fullAddress.trim(),
                    pincode: address.pincode.trim(),
                    latitude: position![0],
                    longitude: position![1]
                },
                paymentMethod
            })

            router.push("/user/my-orders")
        } catch (error) {
            console.log(error)
            alert("Failed to place order. Please try again.")
        } finally {
            setOrderLoading(false)
        }
    }

    const handleOnlinePayment = async () => {
        if (!validateForm()) {
            window.scrollTo({ top: 0, behavior: 'smooth' })
            return
        }

        setOrderLoading(true)

        try {
            const scriptLoaded = await loadRazorpayScript()

            if (!scriptLoaded) {
                alert("Razorpay SDK failed to load.")
                setOrderLoading(false)
                return
            }

            const result = await axios.post("/api/user/payment", {
                userId: userData?._id,
                items: cartData.map(item => ({
                    grocery: item._id,
                    name: item.name,
                    price: item.price,
                    unit: item.unit,
                    quantity: item.quantity,
                    image: item.image
                })),
                totalAmount: finalTotal,
                address: {
                    fullName: address.fullName.trim(),
                    mobile: address.mobile.trim(),
                    city: address.city.trim(),
                    state: address.state.trim(),
                    fullAddress: address.fullAddress.trim(),
                    pincode: address.pincode.trim(),
                    latitude: position![0],
                    longitude: position![1]
                },
                paymentMethod: "online"
            })

//       const options = {
//     key: result.data.key,
//     amount: result.data.amount,
//     currency: result.data.currency,
//     name: result.data.name,
//     description: result.data.description,
//     order_id: result.data.razorpayOrderId,
//     prefill: {
//         name: result.data.prefill?.name || address.fullName,
//         contact: result.data.prefill?.contact || address.mobile,
//         email: userData?.email || ""
//     },

//     method: {
//         upi: true,
//         card: true,
//         netbanking: true,
//         wallet: true,
//         emi: false,
//         paylater: false,
//     },

//     // config: {
//     //     display: {
//     //         blocks: {
//     //             upi: {
//     //                 name: "Pay using UPI",
//     //                 instruments: [
//     //                     { method: "upi" }
//     //                 ]
//     //             },
//     //             cards: {
//     //                 name: "Pay using Card",
//     //                 instruments: [
//     //                     { method: "card" }
//     //                 ]
//     //             },
//     //             other: {
//     //                 name: "Other Payment Methods",
//     //                 instruments: [
//     //                     { method: "netbanking" },
//     //                     { method: "wallet" }
//     //                 ]
//     //             }
//     //         },
//     //         sequence: ["block.upi", "block.cards", "block.other"],
//     //         preferences: {
//     //             show_default_blocks: false
//     //         }
//     //     }
//     // },

//     handler: async function (response: any) {
//         try {
//             await axios.post("/api/user/payment/verify", {
//                 razorpay_order_id: response.razorpay_order_id,
//                 razorpay_payment_id: response.razorpay_payment_id,
//                 razorpay_signature: response.razorpay_signature,
//             })

//             router.push("/user/my-orders")
//         } catch (error) {
//             console.log(error)
//             alert("Payment verification failed.")
//             setOrderLoading(false)
//         }
//     },

//     modal: {
//         ondismiss: function () {
//             setOrderLoading(false)
//         }
//     },

//     theme: {
//         color: "#16a34a"
//     }
// }
const options = {
    key: result.data.key,
    amount: result.data.amount,
    currency: result.data.currency,
    name: result.data.name,
    description: result.data.description,
    order_id: result.data.razorpayOrderId,
    prefill: {
        name: result.data.prefill?.name || address.fullName,
        contact: result.data.prefill?.contact || address.mobile,
        email: userData?.email || ""
    },

    method: {
        upi: true,
        card: true,
        netbanking: true,
        wallet: true,
        emi: false,
        paylater: false,
    },

    handler: async function (response: any) {
        try {
            await axios.post("/api/user/payment/verify", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
            })

            router.push("/user/my-orders")
        } catch (error) {
            console.log(error)
            alert("Payment verification failed.")
            setOrderLoading(false)
        }
    },

    modal: {
        ondismiss: function () {
            setOrderLoading(false)
        }
    },

    theme: {
        color: "#16a34a"
    }
}

            const razorpay = new window.Razorpay(options)
            razorpay.open()
        } catch (error) {
            console.log(error)
            alert("Failed to initiate payment. Please try again.")
            setOrderLoading(false)
        }
    }

    const handleCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords
                    setPosition([latitude, longitude])
                    setHasSearched(true)
                },
                (err) => {
                    console.log('Location error:', err)
                    alert("Unable to get your location. Please enable location services.")
                },
                { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
            )
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setAddress(prev => ({ ...prev, [field]: value }))
        validateField(field, value)
    }

    return (
        <div className='w-[92%] md:w-[80%] mx-auto py-10 relative'>
            <motion.button
                whileTap={{ scale: 0.97 }}
                className='absolute left-0 top-2 flex items-center gap-2 text-green-700 hover:text-green-800 font-semibold transition-colors'
                onClick={() => router.push("/user/cart")}
            >
                <ArrowLeft size={18} />
                <span className='text-sm md:text-base'>Back to cart</span>
            </motion.button>

            <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className='text-3xl md:text-4xl font-bold text-green-700 text-center mb-10'
            >
                Checkout
            </motion.h1>

            <div className='grid md:grid-cols-2 gap-8'>
                {/* Delivery Address Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className='bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100'
                >
                    <h2 className='text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2'>
                        <MapPin className='text-green-700' size={24} />
                        Delivery Address
                    </h2>

                    {/* Error Summary Banner */}
                    {Object.keys(formErrors).length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6"
                        >
                            <div className="flex items-start gap-3">
                                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                                <div className='flex-1'>
                                    <p className="text-red-700 font-semibold text-sm mb-2">
                                        Please fix the following errors:
                                    </p>
                                    <ul className="text-red-600 text-xs space-y-1">
                                        {Object.values(formErrors).map((error, index) => (
                                            <li key={index} className='flex items-center gap-2'>
                                                <span className='w-1 h-1 bg-red-500 rounded-full'></span>
                                                {error}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div className='space-y-4'>
                        {/* Full Name */}
                        <div className='relative'>
                            <User 
                                className={`absolute left-3 top-3.5 ${formErrors.fullName ? 'text-red-500' : 'text-green-600'}`} 
                                size={18} 
                            />
                            <input 
                                type="text" 
                                value={address.fullName} 
                                placeholder='Full Name *' 
                                onChange={(e) => handleInputChange('fullName', e.target.value)}
                                className={`pl-10 w-full border-2 rounded-xl p-3 text-sm transition-all outline-none ${
                                    formErrors.fullName 
                                        ? 'border-red-500 bg-red-50 focus:border-red-600 focus:ring-2 focus:ring-red-200' 
                                        : 'border-gray-200 bg-gray-50 focus:border-green-500 focus:ring-2 focus:ring-green-200'
                                }`} 
                            />
                            {formErrors.fullName && (
                                <p className='text-red-600 text-xs mt-1.5 ml-1 flex items-center gap-1 font-medium'>
                                    <AlertCircle size={12}/> {formErrors.fullName}
                                </p>
                            )}
                        </div>

                        {/* Mobile Number */}
                        <div className='relative'>
                            <Phone 
                                className={`absolute left-3 top-3.5 ${formErrors.mobile ? 'text-red-500' : 'text-green-600'}`} 
                                size={18} 
                            />
                            <input 
                                type="tel" 
                                maxLength={10} 
                                value={address.mobile} 
                                placeholder='Mobile Number *' 
                                onChange={(e) => handleInputChange('mobile', e.target.value.replace(/\D/g, ''))}
                                className={`pl-10 w-full border-2 rounded-xl p-3 text-sm transition-all outline-none ${
                                    formErrors.mobile 
                                        ? 'border-red-500 bg-red-50 focus:border-red-600 focus:ring-2 focus:ring-red-200' 
                                        : 'border-gray-200 bg-gray-50 focus:border-green-500 focus:ring-2 focus:ring-green-200'
                                }`} 
                            />
                            {formErrors.mobile && (
                                <p className='text-red-600 text-xs mt-1.5 ml-1 flex items-center gap-1 font-medium'>
                                    <AlertCircle size={12}/> {formErrors.mobile}
                                </p>
                            )}
                        </div>

                        {/* Full Address */}
                        <div className='relative'>
                            <Home 
                                className={`absolute left-3 top-3.5 ${formErrors.fullAddress ? 'text-red-500' : 'text-green-600'}`} 
                                size={18} 
                            />
                            <input 
                                type="text" 
                                value={address.fullAddress} 
                                placeholder='Full Address (House No, Street, Landmark) *' 
                                onChange={(e) => handleInputChange('fullAddress', e.target.value)}
                                className={`pl-10 w-full border-2 rounded-xl p-3 text-sm transition-all outline-none ${
                                    formErrors.fullAddress 
                                        ? 'border-red-500 bg-red-50 focus:border-red-600 focus:ring-2 focus:ring-red-200' 
                                        : 'border-gray-200 bg-gray-50 focus:border-green-500 focus:ring-2 focus:ring-green-200'
                                }`} 
                            />
                            {formErrors.fullAddress && (
                                <p className='text-red-600 text-xs mt-1.5 ml-1 flex items-center gap-1 font-medium'>
                                    <AlertCircle size={12}/> {formErrors.fullAddress}
                                </p>
                            )}
                        </div>

                        {/* City, State, Pincode */}
                        <div className='grid grid-cols-3 gap-3'>
                            <div className='relative'>
                                <Building 
                                    className={`absolute left-3 top-3.5 ${formErrors.city ? 'text-red-500' : 'text-green-600'}`} 
                                    size={18} 
                                />
                                <input 
                                    type="text" 
                                    value={address.city} 
                                    placeholder='City *' 
                                    onChange={(e) => handleInputChange('city', e.target.value)}
                                    className={`pl-10 w-full border-2 rounded-xl p-3 text-sm transition-all outline-none ${
                                        formErrors.city 
                                            ? 'border-red-500 bg-red-50 focus:border-red-600' 
                                            : 'border-gray-200 bg-gray-50 focus:border-green-500'
                                    }`} 
                                />
                                {formErrors.city && (
                                    <p className='text-red-600 text-[10px] mt-1 flex items-center gap-0.5 font-medium'>
                                        <AlertCircle size={10}/> Required
                                    </p>
                                )}
                            </div>
                            <div className='relative'>
                                <Navigation 
                                    className={`absolute left-3 top-3.5 ${formErrors.state ? 'text-red-500' : 'text-green-600'}`} 
                                    size={18} 
                                />
                                <input 
                                    type="text" 
                                    value={address.state} 
                                    placeholder='State *' 
                                    onChange={(e) => handleInputChange('state', e.target.value)}
                                    className={`pl-10 w-full border-2 rounded-xl p-3 text-sm transition-all outline-none ${
                                        formErrors.state 
                                            ? 'border-red-500 bg-red-50 focus:border-red-600' 
                                            : 'border-gray-200 bg-gray-50 focus:border-green-500'
                                    }`} 
                                />
                                {formErrors.state && (
                                    <p className='text-red-600 text-[10px] mt-1 flex items-center gap-0.5 font-medium'>
                                        <AlertCircle size={10}/> Required
                                    </p>
                                )}
                            </div>
                            <div className='relative'>
                                <MapPin 
                                    className={`absolute left-3 top-3.5 ${formErrors.pincode ? 'text-red-500' : 'text-green-600'}`} 
                                    size={18} 
                                />
                                <input 
                                    type="text" 
                                    maxLength={6} 
                                    value={address.pincode} 
                                    placeholder='Pincode *' 
                                    onChange={(e) => handleInputChange('pincode', e.target.value.replace(/\D/g, ''))}
                                    className={`pl-10 w-full border-2 rounded-xl p-3 text-sm transition-all outline-none ${
                                        formErrors.pincode 
                                            ? 'border-red-500 bg-red-50 focus:border-red-600' 
                                            : 'border-gray-200 bg-gray-50 focus:border-green-500'
                                    }`} 
                                />
                                {formErrors.pincode && (
                                    <p className='text-red-600 text-[10px] mt-1 flex items-center gap-0.5 font-medium'>
                                        <AlertCircle size={10}/> 6 digits
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Search Location */}
                        <div className='mt-6'>
                            <label className='text-sm font-semibold text-gray-700 mb-2 block'>
                                Search Your Location *
                            </label>
                            <div className='flex gap-2'>
                                <div className='relative flex-1'>
                                    <Search 
                                        className={`absolute left-3 top-3.5 ${formErrors.searchQuery ? 'text-red-500' : 'text-green-600'}`} 
                                        size={18} 
                                    />
                                    <input 
                                        type="text" 
                                        placeholder='Search city or area' 
                                        className={`w-full border-2 rounded-xl p-3 pl-10 text-sm outline-none transition-all ${
                                            formErrors.searchQuery 
                                                ? 'border-red-500 bg-red-50 focus:border-red-600 focus:ring-2 focus:ring-red-200' 
                                                : 'border-gray-200 bg-gray-50 focus:border-green-500 focus:ring-2 focus:ring-green-200'
                                        }`} 
                                        value={searchQuery} 
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value)
                                            if (formErrors.searchQuery) {
                                                setFormErrors(prev => {
                                                    const { searchQuery, ...rest } = prev
                                                    return rest
                                                })
                                            }
                                        }}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSearchQuery()
                                            }
                                        }}
                                    />
                                </div>
                                <motion.button 
                                    whileTap={{ scale: 0.95 }}
                                    className='bg-green-600 text-white px-6 rounded-xl hover:bg-green-700 transition-all font-semibold text-sm min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed'
                                    onClick={handleSearchQuery}
                                    disabled={searchLoading}
                                >
                                    {searchLoading ? (
                                        <Loader2 size={18} className='animate-spin mx-auto' />
                                    ) : (
                                        "Search"
                                    )}
                                </motion.button>
                            </div>
                            {formErrors.searchQuery && (
                                <p className='text-red-600 text-xs mt-1.5 ml-1 flex items-center gap-1 font-medium'>
                                    <AlertCircle size={12}/> {formErrors.searchQuery}
                                </p>
                            )}
                        </div>

                        {/* Map */}
                        <div className='mt-4'>
                            <label className='text-sm font-semibold text-gray-700 mb-2 block'>
                                Select Location on Map *
                            </label>
                            <div className={`relative h-[350px] rounded-xl overflow-hidden border-2 shadow-md ${
                                formErrors.location ? 'border-red-500' : 'border-gray-200'
                            }`}>
                                {position && <CheckOutMap position={position} setPosition={setPosition} />}
                                <motion.button
                                    whileTap={{ scale: 0.93 }}
                                    whileHover={{ scale: 1.05 }}
                                    className='absolute bottom-4 right-4 bg-green-600 text-white shadow-xl rounded-full p-3 hover:bg-green-700 transition-all flex items-center justify-center z-[1000]'
                                    onClick={handleCurrentLocation}
                                    title="Use my current location"
                                >
                                    <LocateFixed size={22} />
                                </motion.button>
                            </div>
                            {formErrors.location && (
                                <p className='text-red-600 text-xs mt-1.5 ml-1 flex items-center gap-1 font-medium'>
                                    <AlertCircle size={12}/> {formErrors.location}
                                </p>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Payment & Summary Section */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className='bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 h-fit sticky top-4'
                >
                    <h2 className='text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2'>
                        <CreditCard className='text-green-600' size={24} />
                        Payment Method
                    </h2>
                    
                    <div className='space-y-3 mb-6'>
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setPaymentMethod("online")}
                            className={`flex items-center gap-3 w-full border-2 rounded-xl p-4 transition-all ${
                                paymentMethod === "online"
                                    ? "border-green-600 bg-green-50 shadow-md"
                                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            }`}
                        >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                paymentMethod === "online" ? "border-green-600" : "border-gray-300"
                            }`}>
                                {paymentMethod === "online" && (
                                    <div className='w-3 h-3 rounded-full bg-green-600'></div>
                                )}
                            </div>
                            <CreditCardIcon className='text-green-600' size={20} />
                            <div className='text-left flex-1'>
                                <span className='font-semibold text-gray-800 block'>Pay Online</span>
                                <span className='text-xs text-gray-500'>Secure payment via Razorpay</span>
                            </div>
                        </motion.button>
                        
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setPaymentMethod("cod")}
                            className={`flex items-center gap-3 w-full border-2 rounded-xl p-4 transition-all ${
                                paymentMethod === "cod"
                                    ? "border-green-600 bg-green-50 shadow-md"
                                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            }`}
                        >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                paymentMethod === "cod" ? "border-green-600" : "border-gray-300"
                            }`}>
                                {paymentMethod === "cod" && (
                                    <div className='w-3 h-3 rounded-full bg-green-600'></div>
                                )}
                            </div>
                            <Truck className='text-green-600' size={20} />
                            <div className='text-left flex-1'>
                                <span className='font-semibold text-gray-800 block'>Cash on Delivery</span>
                                <span className='text-xs text-gray-500'>Pay when you receive</span>
                            </div>
                        </motion.button>
                    </div>

                    {/* Order Summary */}
                    <div className='border-t-2 border-gray-100 pt-5 space-y-3'>
                        <h3 className='font-semibold text-gray-800 mb-3'>Order Summary</h3>
                        <div className='space-y-2 text-sm'>
                            <div className='flex justify-between text-gray-600'>
                                <span>Subtotal</span>
                                <span className='font-semibold'>₹{subTotal}</span>
                            </div>
                            <div className='flex justify-between text-gray-600'>
                                <span>Delivery Fee</span>
                                <span className='font-semibold'>₹{deliveryFee}</span>
                            </div>
                            <div className='border-t-2 border-gray-100 pt-3 mt-3 flex justify-between font-bold text-lg'>
                                <span className='text-gray-800'>Total Amount</span>
                                <span className='text-green-600'>₹{finalTotal}</span>
                            </div>
                        </div>
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        whileHover={{ scale: orderLoading ? 1 : 1.02 }}
                        className='w-full mt-6 bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all font-bold text-base shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2'
                        onClick={() => {
                            if (paymentMethod === "cod") {
                                handleCod()
                            } else {
                                handleOnlinePayment()
                            }
                        }}
                        disabled={orderLoading}
                    >
                        {orderLoading ? (
                            <>
                                <Loader2 size={20} className='animate-spin' />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CheckCircle size={20} />
                                {paymentMethod === "cod" ? "Place Order" : "Pay & Place Order"}
                            </>
                        )}
                    </motion.button>

                    <p className='text-xs text-gray-500 text-center mt-4'>
                        By placing this order, you agree to our terms and conditions
                    </p>
                </motion.div>
            </div>
        </div>
    )
}

export default Checkout