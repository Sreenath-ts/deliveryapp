import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Banner from "@/models/banner.model";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();
    const session = await auth();

    if (session?.user?.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid banner id" },
        { status: 400 }
      );
    }

    const banner = await Banner.findByIdAndDelete(id);

    if (!banner) {
      return NextResponse.json(
        { message: "Banner not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Banner deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete banner error:", error);
    return NextResponse.json(
      { message: "Failed to delete banner" },
      { status: 500 }
    );
  }
}