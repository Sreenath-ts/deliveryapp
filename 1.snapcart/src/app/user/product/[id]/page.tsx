import { auth } from '@/auth'
import connectDb from '@/lib/db'
import Grocery, { IGrocery } from '@/models/grocery.model'
import User from '@/models/user.model'
import { redirect } from 'next/navigation'
import ProductView from '@/components/ProductView'

interface PageProps {
  params: Promise<{ id: string }>
}

async function ProductPage({ params }: PageProps) {
  const { id } = await params
  await connectDb()
  const session = await auth()
  if (!session) redirect("/login")

  const user = await User.findById(session?.user?.id)
  if (!user) redirect("/login")

  if (user.role !== "user") redirect("/")

  const product: IGrocery | null = await Grocery.findById(id).lean()
  if (!product) redirect("/")

  const plainProduct = JSON.parse(JSON.stringify(product))
  const plainUser = JSON.parse(JSON.stringify(user))

  return <ProductView product={plainProduct} user={plainUser} />
}

export default ProductPage
