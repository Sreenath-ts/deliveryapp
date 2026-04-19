import { auth } from "@/auth";
import uploadOnCloudinary from "@/lib/cloudinary";
import connectDb from "@/lib/db";
import Banner from "@/models/banner.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDb()
        const session = await auth()

        if (session?.user?.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized. Admin access required." }, { status: 403 })
        }

        const formData = await req.formData()
        const type = (formData.get("type") as string) || 'image'
        const title = formData.get("title") as string
        const subtitle = formData.get("subtitle") as string
        const buttonText = formData.get("buttonText") as string
        const buttonLink = (formData.get("buttonLink") as string) || null
        const badge = (formData.get("badge") as string) || null
        const bgGradient = (formData.get("bgGradient") as string) || null
        const textColor = (formData.get("textColor") as string) || 'white'
        const isActive = formData.get("isActive") === "true"
        const file = formData.get("image") as Blob | null

        if (!title || !subtitle) {
            return NextResponse.json({ message: "Title and subtitle are required" }, { status: 400 })
        }

        let imageUrl: string | null = null
        if (type === 'image') {
            if (!file) {
                return NextResponse.json({ message: "Banner image is required for image-type banners" }, { status: 400 })
            }
            imageUrl = await uploadOnCloudinary(file)
        } else if (type === 'text' && !bgGradient) {
            return NextResponse.json({ message: "A background gradient is required for text-type banners" }, { status: 400 })
        }

        const highest = await Banner.findOne().sort({ order: -1 })
        const order = highest ? highest.order + 1 : 0

        const banner = await Banner.create({
            type,
            title,
            subtitle,
            buttonText,
            buttonLink: buttonLink || undefined,
            badge: badge || undefined,
            image: imageUrl || undefined,
            bgGradient: bgGradient || undefined,
            textColor,
            isActive,
            order
        })

        return NextResponse.json(banner, { status: 201 })
    } catch (error) {
        console.error("Add banner error:", error)
        return NextResponse.json({ message: `Failed to add banner: ${error}` }, { status: 500 })
    }
}
