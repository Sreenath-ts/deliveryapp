import connectDb from "@/lib/db";
import Banner from "@/models/banner.model";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connectDb()

        const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 })

        return NextResponse.json(banners, { status: 200 })
    } catch (error) {
        console.error("Get active banners error:", error)
        return NextResponse.json(
            { message: `Failed to fetch banners: ${error}` },
            { status: 500 }
        )
    }
}
