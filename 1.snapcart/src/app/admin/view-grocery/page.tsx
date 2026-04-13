'use client'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from "motion/react"
import { ArrowLeft, Download, FileSpreadsheet, Loader, Package, Pencil, Search, ShoppingCart, Upload, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { IGrocery } from '@/models/grocery.model'
import Image from 'next/image'

interface IOrder {
    _id: string;
    user: {
        name: string;
        email: string;
    };
    items: {
        name: string;
        price: string;
        quantity: number;
    }[];
    totalAmount: number;
    status: string;
    paymentMethod: string;
    address: {
        fullName: string;
        mobile: string;
        city: string;
        state: string;
    };
    createdAt: string;
}
const categories = [
    "Fruits & Vegetables",
    "Dairy & Eggs",
    "Rice, Atta & Grains",
    "Snacks & Biscuits",
    "Spices & Masalas",
    "Beverages & Drinks",
    "Personal Care",
    "Household Essentials",
    "Instant & Packaged Food",
    "Baby & Pet Care"
]
const units = [
    "kg", "g", "liter", "ml", "piece", "pack"
]
function ViewGrocery() {
    const router = useRouter()
    const [groceries, setGroceries] = useState<IGrocery[]>()
    const [search,setSearch]=useState("")
    const [editing, setEditing] = useState<IGrocery | null>(null)
    const [imagePreview,setImagePreview]=useState<string | null>(null)
    const [backendImage,setBackendImage]=useState<Blob | null>(null)
    const [loading,setLoading]=useState(false)
    const [deleteLoading,setDeleteLoading]=useState(false)
    const [fillterd,setFilltered]=useState<IGrocery[]>()
    const [selectedProduct, setSelectedProduct] = useState<IGrocery | null>(null)
    const [productOrders, setProductOrders] = useState<IOrder[]>([])
    const [ordersLoading, setOrdersLoading] = useState(false)
    useEffect(() => {
        const getGroceries = async () => {
            try {
                const result = await axios.get("/api/admin/get-groceries")
                setGroceries(result.data)
                setFilltered(result.data)
            } catch (error) {
                console.log(error)
            }
        }
        getGroceries()
    }, [])

    useEffect(()=>{
if(editing){
    setImagePreview(editing.image)
}
    },[editing])


    const handleImageUpload=(e:React.ChangeEvent<HTMLInputElement>)=>{
        const file=e.target.files?.[0]
        if(file){
            setBackendImage(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const handleEdit=async ()=>{
        setLoading(true)
        if(!editing) return
        try {
           const formData=new FormData()
            formData.append("groceryId",editing?._id?.toString()!)
    formData.append("name",editing?.name)
    formData.append("category",editing.category)
    formData.append("price",editing.price)
    formData.append("offerPrice",editing.offerPrice || "")
    formData.append("unit",editing.unit)
    if(backendImage){
formData.append("image",backendImage)
    }
            const result=await axios.post("/api/admin/edit-grocery",formData)
            setLoading(false)
            window.location.reload()
        } catch (error) {
            console.log(error)
        }
    }
    const handleDelete=async ()=>{
        setDeleteLoading(true)
        if(!editing) return
        try {
            const result=await axios.post("/api/admin/delete-grocery",{groceryId:editing._id})
            setDeleteLoading(false)
            window.location.reload()
        } catch (error) {
            console.log(error)
        }
    }

    const handleSearch=(e:React.FormEvent)=>{
        e.preventDefault()
        const q=search.toLowerCase()

        setFilltered(
            groceries?.filter(
                (g)=>g.name.toLowerCase().includes(q) || g.category.toLowerCase().includes(q)


            )
        )

    }

    const fetchProductOrders = async (product: IGrocery) => {
        setOrdersLoading(true)
        try {
            const response = await axios.get(`/api/admin/get-product-orders?productId=${product._id}`)
            setProductOrders(response.data)
            setSelectedProduct(product)
        } catch (error) {
            console.error("Failed to fetch product orders:", error)
        }
        setOrdersLoading(false)
    }

    const downloadExcel = () => {
        if (!selectedProduct || productOrders.length === 0) return

        interface ProductOrderRow {
            orderId: string;
            customerName: string;
            customerEmail: string;
            customerMobile: string;
            productName: string;
            quantity: number;
            unitPrice: string;
            totalAmount: number;
            status: string;
            paymentMethod: string;
            orderDate: string;
            city: string;
            state: string;
        }

        const productInOrders: ProductOrderRow[] = productOrders.map((order: IOrder) => {
            const item = order.items.find((i: { name: string }) => i.name === selectedProduct.name)
            return {
                orderId: order._id,
                customerName: order.user?.name || order.address?.fullName || 'N/A',
                customerEmail: order.user?.email || 'N/A',
                customerMobile: order.address?.mobile || 'N/A',
                productName: selectedProduct.name,
                quantity: item?.quantity || 0,
                unitPrice: item?.price || selectedProduct.price,
                totalAmount: order.totalAmount,
                status: order.status,
                paymentMethod: order.paymentMethod,
                orderDate: new Date(order.createdAt).toLocaleDateString(),
                city: order.address?.city || 'N/A',
                state: order.address?.state || 'N/A'
            }
        })

        const headers = [
            'Order ID',
            'Customer Name',
            'Customer Email',
            'Customer Mobile',
            'Product Name',
            'Quantity',
            'Unit Price',
            'Total Amount',
            'Status',
            'Payment Method',
            'Order Date',
            'City',
            'State'
        ]

        const csvContent = [
            headers.join(','),
            ...productInOrders.map((row: ProductOrderRow) => [
                row.orderId,
                `"${row.customerName}"`,
                `"${row.customerEmail}"`,
                `"${row.customerMobile}"`,
                `"${row.productName}"`,
                row.quantity,
                row.unitPrice,
                row.totalAmount,
                `"${row.status}"`,
                `"${row.paymentMethod}"`,
                `"${row.orderDate}"`,
                `"${row.city}"`,
                `"${row.state}"`
            ].join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `${selectedProduct.name}_orders_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }
    return (
        <div className="pt-4 w-[95%] md:w-[85%] mx-auto pb-20">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 text-center sm:text-left"
            >
                <button
                    onClick={() => router.push("/")}
                    className='flex items-center justify-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 font-semibold px-4 py-2 rounded-full transition w-full sm:w-auto'
                ><ArrowLeft size={18} /><span>Back</span></button>
                <h1 className='text-2xl md:text-3xl font-extrabold text-green-700 flex items-center justify-center gap-2'><Package size={28} className='text-green-600' />Manage Groceries</h1>
            </motion.div>

            <motion.form initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                onSubmit={handleSearch}
                className="flex items-center bg-white border border-gray-200 rounded-full px-5 py-3 shadow-sm mb-10 hover:shadow-lg transition-all max-w-lg mx-auto w-full">
                <Search className="text-gray-500 w-5 h-5 mr-2" />
                <input type="text" className='w-full outline-none text-gray-700 placeholder-gray-400' placeholder='Search by name or category...' value={search} onChange={(e)=>setSearch(e.target.value)}/>
            </motion.form>
            <div className='space-y-4'>
                {fillterd?.map((g: IGrocery, i: number) => (
                    <motion.div
                        key={i}
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 100 }}
                        className="bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 flex flex-col sm:flex-row items-center sm:items-start gap-5 p-5 transition-all cursor-pointer"
                        onClick={() => fetchProductOrders(g)}
                    >
                        <div className='relative w-full sm:w-44 aspect-square rounded-xl overflow-hidden border border-gray-200'>
                            <Image
                                src={g.image}
                                alt={g.name}
                                fill
                                className='object-cover hover:scale-110 transition-transform duration-500'
                            />
                        </div>

                        <div className='flex-1 flex flex-col justify-between w-full'>
                            <div>
                                <h3 className='font-semibold text-gray-800 text-lg truncate'>{g.name}</h3>
                                <p className='text-gray-500 text-sm capitalize'>{g.category}</p>
                            </div>

                            <div className='mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
                                <div className='flex items-center gap-2'>
                                    {g.offerPrice ? (
                                        <div className='flex items-center gap-2'>
                                            <span className='text-green-700 font-bold text-lg'>₹{g.offerPrice}</span>
                                            <span className='text-gray-400 line-through text-sm'>₹{g.price}</span>
                                            <span className='bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full'>
                                                {Math.round((parseFloat(g.price) - parseFloat(g.offerPrice)) / parseFloat(g.price) * 100)}% OFF
                                            </span>
                                        </div>
                                    ) : (
                                        <p className='text-green-700 font-bold text-lg'>
                                            ₹{g.price}/ <span className='text-gray-500 text-sm font-medium ml-1'>{g.unit}</span>
                                        </p>
                                    )}
                                </div>
                                <button
                                    className='bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-green-700 transition-all'
                                    onClick={(e: React.MouseEvent) => {
                                        e.stopPropagation()
                                        setEditing(g)
                                    }}
                                >
                                    <Pencil size={15} /> Edit
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {editing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm px-4"
                    >

                        <motion.div
                            initial={{ y: 40, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 40, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7 relative"
                        >
                        <div className='flex justify-between items-center mb-4'>
                            <h2 className='text-2xl font-bold text-green-700'>Edit Grocery</h2>
                            <button className='text-gray-600 hover:text-red-600' onClick={()=>setEditing(null)}>
                            <X size={18}/>
                            </button>
                        </div>
                        <div className='relative aspect-square w-full rounded-lg overflow-hidden mb-4 border border-gray-200 group'>
                         {imagePreview && <Image
                         src={imagePreview}
                         alt={editing.name}
                         fill
                         className='object-cover'
                         />}
                         <label htmlFor='imageUpload' className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity'><Upload size={28} className='text-green-500'/></label>
                         <input type="file" accept='image/*' hidden id='imageUpload' onChange={handleImageUpload}/>
                        </div>

                        <div className='space-y-4'>
                           <input 
                           type="text" 
                           placeholder='Enter Grocery Name'
                           value={editing.name}
                           onChange={(e)=>setEditing({...editing,name:e.target.value})}
                           className='w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none'/>

                           <select 
                           className='w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none bg-white'
                           value={editing.category}
                           onChange={(e)=>setEditing({...editing,category:e.target.value})}
                           >
                            <option>Select Category</option>
                             {categories.map((c,i)=>(
                                <option key={i} value={c}>{c}</option>
                             ))}
                           </select>
                            <div className='grid grid-cols-2 gap-3'>
                                <input 
                               type="text" 
                               placeholder='Price'
                               value={editing.price}
                               onChange={(e)=>setEditing({...editing,price:e.target.value})}
                               className='w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none'/>
                                <input 
                               type="text" 
                               placeholder='Offer Price (Optional)'
                               value={editing.offerPrice || ""}
                               onChange={(e)=>setEditing({...editing,offerPrice:e.target.value})}
                               className='w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none'/>
                            </div>
                            <select 
                           className='w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none bg-white'
                           value={editing.unit}
                           onChange={(e)=>setEditing({...editing,unit:e.target.value})}
                           >
                            <option>Select Category</option>
                             {units.map((u,i)=>(
                                <option key={i} value={u}>{u}</option>
                             ))}
                           </select>
                        </div>
                        <div className='flex justify-end gap-3 mt-6'>
                        <button className="px-4 py-2 rounded-lg bg-green-600 text-white flex items-center gap-2 hover:bg-green-700 transition-all"
                        onClick={handleEdit}
                        disabled={loading}
                        >
                         {loading?<Loader size={14}/>:"Edit Grocery"}  
                        </button>
                        <button className="px-4 py-2 rounded-lg  bg-red-600 text-white flex items-center gap-2 hover:bg-red-700  transition"
                        onClick={handleDelete}
                        disabled={deleteLoading}
                        >
                            {deleteLoading?<Loader size={14}/>:"Delete Grocery"}  
                        </button>
                       </div>
                        </motion.div>


                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedProduct && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm px-4"
                    >
                        <motion.div
                            initial={{ y: 40, opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 40, opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
                        >
                            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-white/30">
                                            <Image
                                                src={selectedProduct.image}
                                                alt={selectedProduct.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold">{selectedProduct.name}</h2>
                                            <p className="text-green-100 text-sm">{selectedProduct.category}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedProduct(null)}
                                        className="text-white/80 hover:text-white transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                {ordersLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader className="w-8 h-8 animate-spin text-green-600" />
                                    </div>
                                ) : productOrders.length === 0 ? (
                                    <div className="text-center py-12">
                                        <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500 text-lg">No orders found for this product</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="text-gray-600">
                                                    <span className="font-semibold text-gray-800">{productOrders.length}</span> orders found
                                                </p>
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={downloadExcel}
                                                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                                            >
                                                <FileSpreadsheet size={18} />
                                                <Download size={18} />
                                                Export Excel
                                            </motion.button>
                                        </div>

                                        <div className="overflow-y-auto max-h-[50vh] border border-gray-200 rounded-xl">
                                            <table className="w-full">
                                                <thead className="bg-gray-50 sticky top-0">
                                                    <tr>
                                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Order ID</th>
                                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {productOrders.map((order) => {
                                                        const item = order.items.find((i: { name: string }) => i.name === selectedProduct.name)
                                                        return (
                                                            <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">#{order._id.slice(-6)}</td>
                                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                                    {order.user?.name || order.address?.fullName || 'N/A'}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-600">{item?.quantity || 0}</td>
                                                                <td className="px-4 py-3 text-sm font-medium text-green-700">₹{order.totalAmount}</td>
                                                                <td className="px-4 py-3">
                                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                        order.status === 'delivered'
                                                                            ? 'bg-green-100 text-green-800'
                                                                            : order.status === 'out of delivery'
                                                                            ? 'bg-blue-100 text-blue-800'
                                                                            : 'bg-yellow-100 text-yellow-800'
                                                                    }`}>
                                                                        {order.status}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-500">
                                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                                </td>
                                                            </tr>
                                                        )
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default ViewGrocery
