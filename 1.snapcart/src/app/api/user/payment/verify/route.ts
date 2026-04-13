import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const body = await req.json();
    console.log("Verify request body:", body);

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { message: "Missing payment verification fields" },
        { status: 400 }
      );
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    console.log("Generated signature:", generatedSignature);
    console.log("Received signature:", razorpay_signature);

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { message: "Invalid payment signature" },
        { status: 400 }
      );
    }

    const order = await Order.findOne({
      "paymentDetails.razorpayOrderId": razorpay_order_id,
    });

    console.log("Order found by paymentDetails.razorpayOrderId:", order?._id);

    if (!order) {
      return NextResponse.json(
        { message: "Order not found", razorpay_order_id },
        { status: 404 }
      );
    }

    order.isPaid = true;
    order.paymentStatus = "paid";
    order.paymentMethod = "online";
    order.paymentDetails = {
      ...order.paymentDetails,
      gateway: "razorpay",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    };

    await order.save();

    console.log("Order marked paid:", order._id);

    return NextResponse.json(
      {
        success: true,
        message: "Payment verified successfully",
        orderId: order._id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verify Razorpay payment error:", error);
    return NextResponse.json(
      {
        message: "Payment verification failed",
        error: String(error),
      },
      { status: 500 }
    );
  }
}