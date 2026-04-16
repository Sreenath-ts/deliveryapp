'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

function AutoScrollToProducts() {
    const searchParams = useSearchParams()

    useEffect(() => {
        const category = searchParams.get('category')
        const q = searchParams.get('q')

        if (!category && !q) return

        const el = document.getElementById('products-section')
        if (!el) return

        // Small delay so the server-rendered content has painted
        const timer = setTimeout(() => {
            const navHeight = 96 // fixed navbar height (matches pt-24 = 6rem)
            const top = el.getBoundingClientRect().top + window.scrollY - navHeight - 16
            window.scrollTo({ top, behavior: 'smooth' })
        }, 80)

        return () => clearTimeout(timer)
    }, [searchParams])

    return null
}

export default AutoScrollToProducts
