import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Banner from "@/models/banner.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDb()
        const session = await auth()
        
        if (session?.user?.role !== "admin") {
            return NextResponse.json(
                { message: "Unauthorized. Admin access required." },
                { status: 403 }
            )
        }

        const banners = await Banner.find().sort({ order: 1, createdAt: -1 })

        return NextResponse.json(banners, { status: 200 })
    } catch (error) {
        console.error("Get banners error:", error)
        return NextResponse.json(
            { message: `Failed to fetch banners: ${error}` },
            { status: 500 }
        )
    }
}