import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Banner from "@/models/banner.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDb()
        const session = await auth()

        if (session?.user?.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
        }

        const { idA, idB } = await req.json()

        const [bannerA, bannerB] = await Promise.all([
            Banner.findById(idA),
            Banner.findById(idB),
        ])

        if (!bannerA || !bannerB) {
            return NextResponse.json({ message: "One or both banners not found" }, { status: 404 })
        }

        const tempOrder = bannerA.order
        bannerA.order = bannerB.order
        bannerB.order = tempOrder

        await Promise.all([bannerA.save(), bannerB.save()])

        return NextResponse.json({ message: "Order swapped" }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: `Failed to swap order: ${error}` }, { status: 500 })
    }
}
