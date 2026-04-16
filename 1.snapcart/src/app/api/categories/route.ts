import connectDb from "@/lib/db";
import Category from "@/models/category.model";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connectDb()
        const categories = await Category.find({ enabled: true }).sort({ createdAt: 1 })
        return NextResponse.json(categories, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: `Error: ${error}` }, { status: 500 })
    }
}
