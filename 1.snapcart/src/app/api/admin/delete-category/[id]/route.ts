import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Category from "@/models/category.model";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
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
        const deleted = await Category.findByIdAndDelete(id)
        if (!deleted) {
            return NextResponse.json({ message: "Category not found" }, { status: 404 })
        }
        return NextResponse.json({ message: "Category deleted" }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: `Error: ${error}` }, { status: 500 })
    }
}
