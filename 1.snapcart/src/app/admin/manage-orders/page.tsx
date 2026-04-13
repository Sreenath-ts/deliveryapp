'use client'
import AdminOrderCard from '@/components/AdminOrderCard'
import { getSocket } from '@/lib/socket'

import { IUser } from '@/models/user.model'
import axios from 'axios'
import { ArrowLeft, Download, Search, Filter, X, Package, Clock, Truck, CheckCircle } from 'lucide-react'
import * as XLSX from 'xlsx'

import { useRouter } from 'next/navigation'
import React, { useEffect, useState, useMemo } from 'react'

interface IOrder {
    _id?: string
    user: string
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
    assignment?: string
    assignedDeliveryBoy?: IUser
    status: "pending" | "out of delivery" | "delivered",
    createdAt?: Date
    updatedAt?: Date
}

type FilterStatus = "all" | "pending" | "out of delivery" | "delivered"
type FilterPayment = "all" | "cod" | "online"

function ManageOrders() {
    const [orders, setOrders] = useState<IOrder[]>()
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<FilterStatus>("all")
    const [paymentFilter, setPaymentFilter] = useState<FilterPayment>("all")
    const [showFilters, setShowFilters] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const getOrders = async () => {
            try {
                const result = await axios.get("/api/admin/get-orders")
                setOrders(result.data)
            } catch (error) {
                console.log(error)
            }
        }
        getOrders()
    }, [])


    useEffect(() => {
        const socket = getSocket()
        socket?.on("new-order", (newOrder) => {
            setOrders((prev) => [newOrder, ...prev!])
        })
        socket.on("order-assigned", ({ orderId, assignedDeliveryBoy }) => {
            setOrders((prev) => prev?.map((o) => (
                o._id == orderId ? { ...o, assignedDeliveryBoy } : o
            )))
        })
        return () => {
            socket.off("new-order")
            socket.off("order-assigned")

        }
    }, [])

    // Filter and search orders
    const filteredOrders = useMemo(() => {
        if (!orders) return []

        return orders.filter(order => {
            // Search filter
            const matchesSearch = searchQuery === "" ||
                order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.address.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.address.mobile.includes(searchQuery) ||
                order.address.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.assignedDeliveryBoy?.name.toLowerCase().includes(searchQuery.toLowerCase())

            // Status filter
            const matchesStatus = statusFilter === "all" || order.status === statusFilter

            // Payment filter
            const matchesPayment = paymentFilter === "all" || order.paymentMethod === paymentFilter

            return matchesSearch && matchesStatus && matchesPayment
        })
    }, [orders, searchQuery, statusFilter, paymentFilter])

    const downloadExcel = () => {
        if (!filteredOrders || filteredOrders.length === 0) return

        const data = filteredOrders.map(order => ({
            'Order ID': order._id?.toString() || '',
            'Customer Name': order.address.fullName,
            'Mobile': order.address.mobile,
            'Address': order.address.fullAddress,
            'City': order.address.city,
            'State': order.address.state,
            'Pincode': order.address.pincode,
            'Total Amount': order.totalAmount,
            'Payment Method': order.paymentMethod === 'cod' ? 'Cash On Delivery' : 'Online Payment',
            'Payment Status': order.isPaid ? 'Paid' : 'Unpaid',
            'Order Status': order.status,
            'Assigned Delivery Boy': order.assignedDeliveryBoy?.name || 'Not Assigned',
            'Delivery Boy Mobile': order.assignedDeliveryBoy?.mobile || '',
            'Order Date': order.createdAt ? new Date(order.createdAt).toLocaleString() : '',
            'Items': order.items.map(item => `${item.name} (${item.quantity} ${item.unit})`).join(', ')
        }))

        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Orders')
        XLSX.writeFile(wb, `orders_${new Date().toISOString().split('T')[0]}.xlsx`)
    }

    const getStatusStats = () => {
        if (!orders) return { pending: 0, outOfDelivery: 0, delivered: 0, total: 0 }
        return {
            pending: orders.filter(o => o.status === "pending").length,
            outOfDelivery: orders.filter(o => o.status === "out of delivery").length,
            delivered: orders.filter(o => o.status === "delivered").length,
            total: orders.length
        }
    }

    const stats = getStatusStats()

    const clearFilters = () => {
        setSearchQuery("")
        setStatusFilter("all")
        setPaymentFilter("all")
    }

    const hasActiveFilters = searchQuery !== "" || statusFilter !== "all" || paymentFilter !== "all"

    return (
        <div className='min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 w-full'>
            {/* Header */}
            <div className='fixed top-0 left-0 w-full backdrop-blur-xl bg-white/80 shadow-sm border-b z-50'>
                <div className='max-w-7xl mx-auto flex items-center justify-between px-4 py-4'>
                    <div className='flex items-center gap-4'>
                        <button className='p-2 bg-green-100 rounded-full hover:bg-green-200 active:scale-95 transition-all' onClick={() => router.push("/")}>
                            <ArrowLeft size={24} className="text-green-700" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Manage Orders</h1>
                            <p className="text-sm text-gray-500">{filteredOrders?.length || 0} orders found</p>
                        </div>
                    </div>
                    {orders && orders.length > 0 && (
                        <button
                            onClick={downloadExcel}
                            className='hidden md:flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all active:scale-95 shadow-lg hover:shadow-xl'
                        >
                            <Download size={18} />
                            Download Excel
                        </button>
                    )}
                </div>
            </div>

            <div className='max-w-7xl mx-auto px-4 pt-28 pb-16'>
                {/* Stats Cards */}
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
                    <div className='bg-white rounded-2xl p-4 shadow-md border border-gray-100'>
                        <div className='flex items-center gap-3'>
                            <div className='p-2 bg-blue-100 rounded-lg'>
                                <Package className='w-6 h-6 text-blue-600' />
                            </div>
                            <div>
                                <p className='text-sm text-gray-500'>Total</p>
                                <p className='text-2xl font-bold text-gray-800'>{stats.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className='bg-white rounded-2xl p-4 shadow-md border border-gray-100'>
                        <div className='flex items-center gap-3'>
                            <div className='p-2 bg-yellow-100 rounded-lg'>
                                <Clock className='w-6 h-6 text-yellow-600' />
                            </div>
                            <div>
                                <p className='text-sm text-gray-500'>Pending</p>
                                <p className='text-2xl font-bold text-gray-800'>{stats.pending}</p>
                            </div>
                        </div>
                    </div>

                    <div className='bg-white rounded-2xl p-4 shadow-md border border-gray-100'>
                        <div className='flex items-center gap-3'>
                            <div className='p-2 bg-orange-100 rounded-lg'>
                                <Truck className='w-6 h-6 text-orange-600' />
                            </div>
                            <div>
                                <p className='text-sm text-gray-500'>Out for Delivery</p>
                                <p className='text-2xl font-bold text-gray-800'>{stats.outOfDelivery}</p>
                            </div>
                        </div>
                    </div>

                    <div className='bg-white rounded-2xl p-4 shadow-md border border-gray-100'>
                        <div className='flex items-center gap-3'>
                            <div className='p-2 bg-green-100 rounded-lg'>
                                <CheckCircle className='w-6 h-6 text-green-600' />
                            </div>
                            <div>
                                <p className='text-sm text-gray-500'>Delivered</p>
                                <p className='text-2xl font-bold text-gray-800'>{stats.delivered}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filter Section */}
                <div className='bg-white rounded-2xl shadow-lg border border-gray-100 p-4 mb-6'>
                    {/* Search Bar */}
                    <div className='relative mb-4'>
                        <Search className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5' />
                        <input
                            type="text"
                            placeholder="Search by order ID, customer name, mobile, city, or delivery boy..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition-all'
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
                            >
                                <X className='w-5 h-5' />
                            </button>
                        )}
                    </div>

                    {/* Filter Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className='flex items-center gap-2 text-green-700 font-medium hover:text-green-800 transition-colors'
                    >
                        <Filter className='w-5 h-5' />
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                        {hasActiveFilters && !showFilters && (
                            <span className='bg-green-600 text-white text-xs px-2 py-0.5 rounded-full'>Active</span>
                        )}
                    </button>

                    {/* Filters */}
                    {showFilters && (
                        <div className='mt-4 pt-4 border-t border-gray-200'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                {/* Status Filter */}
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Order Status</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
                                        className='w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition-all bg-white'
                                    >
                                        <option value="all">All Statuses</option>
                                        <option value="pending">Pending</option>
                                        <option value="out of delivery">Out for Delivery</option>
                                        <option value="delivered">Delivered</option>
                                    </select>
                                </div>

                                {/* Payment Filter */}
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Payment Method</label>
                                    <select
                                        value={paymentFilter}
                                        onChange={(e) => setPaymentFilter(e.target.value as FilterPayment)}
                                        className='w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition-all bg-white'
                                    >
                                        <option value="all">All Methods</option>
                                        <option value="cod">Cash on Delivery</option>
                                        <option value="online">Online Payment</option>
                                    </select>
                                </div>
                            </div>

                            {/* Clear Filters Button */}
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className='mt-4 flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition-colors'
                                >
                                    <X className='w-4 h-4' />
                                    Clear All Filters
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Mobile Download Button */}
                {orders && orders.length > 0 && (
                    <div className='md:hidden mb-4'>
                        <button
                            onClick={downloadExcel}
                            className='w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-medium transition-all active:scale-95 shadow-lg'
                        >
                            <Download size={18} />
                            Download Excel ({filteredOrders.length} orders)
                        </button>
                    </div>
                )}

                {/* Orders List */}
                <div className='space-y-4'>
                    {filteredOrders && filteredOrders.length > 0 ? (
                        filteredOrders.map((order, index) => (
                            <AdminOrderCard key={order._id || index} order={order} />
                        ))
                    ) : (
                        <div className='bg-white rounded-2xl shadow-md border border-gray-100 p-12 text-center'>
                            <Package className='w-16 h-16 text-gray-300 mx-auto mb-4' />
                            <h3 className='text-xl font-semibold text-gray-700 mb-2'>No Orders Found</h3>
                            <p className='text-gray-500'>
                                {hasActiveFilters
                                    ? "Try adjusting your filters or search query"
                                    : "Orders will appear here once customers place them"}
                            </p>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className='mt-4 text-green-600 hover:text-green-700 font-medium'
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ManageOrders