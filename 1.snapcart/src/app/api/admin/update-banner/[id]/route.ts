import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Banner from "@/models/banner.model";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

export async function PUT(
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

    const formData = await req.formData();

    const title = formData.get("title") as string;
    const subtitle = formData.get("subtitle") as string;
    const buttonText = formData.get("buttonText") as string;
    const isActive = formData.get("isActive") === "true";
    const image = formData.get("image") as File | null;

    const banner = await Banner.findById(id);

    if (!banner) {
      return NextResponse.json(
        { message: "Banner not found" },
        { status: 404 }
      );
    }

    banner.title = title;
    banner.subtitle = subtitle;
    banner.buttonText = buttonText;
    banner.isActive = isActive;

    // image upload logic here if new image is provided

    await banner.save();

    return NextResponse.json(
      { message: "Banner updated successfully", banner },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update banner error:", error);
    return NextResponse.json(
      { message: "Failed to update banner" },
      { status: 500 }
    );
  }
}