import connectDb from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import { sendWebPush } from "@/lib/sendWebPush";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDb()
        const { userId, items, paymentMethod, totalAmount, address } = await req.json()
        if (!items || !userId || !paymentMethod || !totalAmount || !address) {
            return NextResponse.json(
                { message: "please send all credentials" },
                { status: 400 }
            )
        }
        const user = await User.findById(userId)
        if (!user) {
            return NextResponse.json(
                { message: "user not found" },
                { status: 400 }
            )
        }

        const newOrder = await Order.create({
            user: userId,
            items,
            paymentMethod,
            totalAmount,
            address
        })


        await emitEventHandler("new-order", newOrder)

        const admins = await User.find({ role: "admin", pushSubscription: { $ne: null } })
        const shortId = newOrder._id?.toString().slice(-6).toUpperCase()
        await Promise.all(
            admins.map((admin) =>
                sendWebPush(admin.pushSubscription, {
                    title: "New Order!",
                    body: `Order #${shortId} — ₹${newOrder.totalAmount}`,
                    url: "/admin/manage-orders",
                })
            )
        )

        return NextResponse.json(
            newOrder,
            { status: 201 }
        )

    } catch (error) {
 return NextResponse.json(
                {message:`place order error ${error}`},
                {status:500}
            )
    }
}