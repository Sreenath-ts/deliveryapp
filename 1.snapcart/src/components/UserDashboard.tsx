import React from 'react'
import HeroSection from './HeroSection'
import CategorySlider from './CategorySlider'
import { IGrocery } from '@/models/grocery.model'
import GroceryItemCard from './GroceryItemCard'
import { Sparkles, Package } from 'lucide-react'

async function UserDashboard({ groceryList }: { groceryList: IGrocery[] }) {
    const plainGrocery = JSON.parse(JSON.stringify(groceryList))

    return (
        <div className='min-h-screen bg-gradient-to-b from-white via-green-50/30 to-white pt-24'>
            {/* Hero Section */}
          <HeroSection targetId="products-section" />

            {/* Category Slider */}
            <CategorySlider />

            {/* Products Section */}
            <div
                id="products-section"
                className='max-w-7xl mx-auto px-4 md:px-6 mt-16 md:mt-24 pb-16'
            >
                {/* Section Header */}
                <div className='mb-10'>
                    <div className='flex items-center gap-2 mb-2'>
                        <Sparkles className='w-6 h-6 text-green-600' />
                        <span className='text-sm font-semibold text-green-600 uppercase tracking-wider'>
                            Fresh Picks
                        </span>
                    </div>
                    <div className='flex items-center justify-between'>
                        <div>
                            <h2 className='text-3xl md:text-4xl font-bold text-gray-800 mb-2'>
                                Popular Grocery Items
                            </h2>
                            <p className='text-gray-600'>Hand-picked fresh produce delivered to your door</p>
                        </div>
                        <div className='hidden md:flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full'>
                            <Package className='w-5 h-5 text-green-600' />
                            <span className='text-sm font-semibold text-green-700'>
                                {plainGrocery.length} Products
                            </span>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                {plainGrocery.length > 0 ? (
                    <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6'>
                        {plainGrocery.map((item: any, index: number) => (
                            <GroceryItemCard key={index} item={item} />
                        ))}
                    </div>
                ) : (
                    <div className='text-center py-20'>
                        <div className='inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6'>
                            <Package className='w-12 h-12 text-gray-400' />
                        </div>
                        <h3 className='text-2xl font-bold text-gray-700 mb-2'>No Products Found</h3>
                        <p className='text-gray-500'>Try adjusting your search or browse our categories</p>
                    </div>
                )}
            </div>

            {/* Features Section */}
            <div className='bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 py-16 md:py-20'>
                <div className='max-w-7xl mx-auto px-4 md:px-6'>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
                        {[
                            {
                                icon: '🚚',
                                title: 'Fast Delivery',
                                description: 'Get your groceries delivered in 30 minutes'
                            },
                            {
                                icon: '✨',
                                title: 'Fresh Products',
                                description: 'Farm-fresh produce delivered daily'
                            },
                            {
                                icon: '💰',
                                title: 'Best Prices',
                                description: 'Unbeatable prices on all products'
                            }
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className='bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 text-center hover:bg-white/20 transition-all duration-300'
                            >
                                <div className='text-5xl mb-4'>{feature.icon}</div>
                                <h3 className='text-xl font-bold text-white mb-2'>{feature.title}</h3>
                                <p className='text-green-100'>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserDashboard