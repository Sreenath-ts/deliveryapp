import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDb();
        const { searchParams } = new URL(req.url);
        const productId = searchParams.get("productId");

        if (!productId) {
            return NextResponse.json(
                { message: "Product ID is required" },
                { status: 400 }
            );
        }

        const orders = await Order.find({
            "items.grocery": productId
        })
            .populate("user assignedDeliveryBoy")
            .sort({ createdAt: -1 });

        return NextResponse.json(
            orders,
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: `get product orders error: ${error}` },
            { status: 500 }
        );
    }
}
