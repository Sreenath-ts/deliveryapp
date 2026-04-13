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
            return NextResponse.json(
                { message: "Unauthorized. Admin access required." },
                { status: 403 }
            )
        }

        const formData = await req.formData()
        const title = formData.get("title") as string
        const subtitle = formData.get("subtitle") as string
        const buttonText = formData.get("buttonText") as string
        const isActive = formData.get("isActive") === "true"
        const file = formData.get("image") as Blob | null

        if (!title || !subtitle || !buttonText) {
            return NextResponse.json(
                { message: "Title, subtitle, and button text are required" },
                { status: 400 }
            )
        }

        let imageUrl 
        if (file) {
            imageUrl = await uploadOnCloudinary(file)
        } else {
            return NextResponse.json(
                { message: "Banner image is required" },
                { status: 400 }
            )
        }

        // Get the highest order number and add 1
        const highestOrderBanner = await Banner.findOne().sort({ order: -1 })
        const order = highestOrderBanner ? highestOrderBanner.order + 1 : 0

        const banner = await Banner.create({
            title,
            subtitle,
            buttonText,
            image: imageUrl,
            isActive,
            order
        })

        return NextResponse.json(banner, { status: 201 })
    } catch (error) {
        console.error("Add banner error:", error)
        return NextResponse.json(
            { message: `Failed to add banner: ${error}` },
            { status: 500 }
        )
    }
}