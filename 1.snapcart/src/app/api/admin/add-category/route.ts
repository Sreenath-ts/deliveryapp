import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Category from "@/models/category.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDb()
        const session = await auth()
        if (session?.user?.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }
        const { name, icon, gradient } = await req.json()
        if (!name || !icon || !gradient) {
            return NextResponse.json({ message: "All fields are required" }, { status: 400 })
        }
        const existing = await Category.findOne({ name: name.trim() })
        if (existing) {
            return NextResponse.json({ message: "Category already exists" }, { status: 400 })
        }
        const category = await Category.create({ name: name.trim(), icon, gradient })
        return NextResponse.json(category, { status: 201 })
    } catch (error) {
        return NextResponse.json({ message: `Error: ${error}` }, { status: 500 })
    }
}
