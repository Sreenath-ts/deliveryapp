import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Category from "@/models/category.model";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connectDb()
        const session = await auth()
        if (session?.user?.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }
        const categories = await Category.find({}).sort({ createdAt: 1 })
        return NextResponse.json(categories, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: `Error: ${error}` }, { status: 500 })
    }
}
