import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Category from "@/models/category.model";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await connectDb()
        const session = await auth()
        if (session?.user?.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }
        const { id } = await context.params
        const category = await Category.findById(id)
        if (!category) {
            return NextResponse.json({ message: "Category not found" }, { status: 404 })
        }
        category.enabled = !category.enabled
        await category.save()
        return NextResponse.json(category, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: `Error: ${error}` }, { status: 500 })
    }
}
