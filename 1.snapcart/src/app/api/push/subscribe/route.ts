import connectDb from "@/lib/db"
import User from "@/models/user.model"
import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        await connectDb()
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ message: "unauthorized" }, { status: 401 })
        }
        const subscription = await req.json()
        await User.findOneAndUpdate(
            { email: session.user.email },
            { pushSubscription: subscription }
        )
        return NextResponse.json({ message: "subscription saved" }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: `subscribe error ${error}` }, { status: 500 })
    }
}
