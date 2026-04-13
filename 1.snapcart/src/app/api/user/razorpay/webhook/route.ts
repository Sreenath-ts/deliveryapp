import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { message: "Missing webhook signature" },
        { status: 400 }
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json(
        { message: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);

    if (event.event === "order.paid") {
      await connectDb();

      const razorpayOrderId = event.payload.order.entity.id;
      const razorpayPaymentId = event.payload.payment.entity.id;

      const order = await Order.findOne({
        "paymentDetails.razorpayOrderId": razorpayOrderId,
      });

      if (order) {
        order.isPaid = true;
        order.paymentStatus = "paid";
        order.paymentDetails = {
          ...order.paymentDetails,
          gateway: "razorpay",
          razorpayOrderId,
          razorpayPaymentId,
        };
        await order.save();
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json(
      { message: "Webhook handling failed" },
      { status: 500 }
    );
  }
}