import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const body = await req.json();
    const { userId, items, totalAmount, address } = body;

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is missing" },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { message: "Cart is empty" },
        { status: 400 }
      );
    }

    if (!totalAmount || Number(totalAmount) <= 0) {
      return NextResponse.json(
        { message: "Invalid total amount" },
        { status: 400 }
      );
    }

    if (!address) {
      return NextResponse.json(
        { message: "Address is missing" },
        { status: 400 }
      );
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(Number(totalAmount) * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    console.log("Created Razorpay order:", razorpayOrder.id);

    const order = await Order.create({
      user: userId,
      items,
      totalAmount: Number(totalAmount),
      address,
      paymentMethod: "online",
      isPaid: false,
      paymentStatus: "pending",
      status: "pending",
      paymentDetails: {
        gateway: "razorpay",
        razorpayOrderId: razorpayOrder.id,
        razorpayPaymentId: "",
        razorpaySignature: "",
      },
    });

    console.log("Created DB order:", order._id);
    console.log("Saved paymentDetails:", order.paymentDetails);

    return NextResponse.json(
      {
        success: true,
        orderId: order._id,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        name: "Snapcart",
        description: "Order Payment",
        prefill: {
          name: address.fullName,
          contact: address.mobile,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Create Razorpay order error:", error);
    return NextResponse.json(
      {
        message: "Failed to create payment order",
        error: String(error),
      },
      { status: 500 }
    );
  }
}