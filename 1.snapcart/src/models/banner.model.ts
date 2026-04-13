import mongoose, { Schema, model, models } from "mongoose";

export interface IBanner {
    title: string;
    subtitle: string;
    buttonText: string;
    image: string;
    isActive: boolean;
    order: number;
}

const bannerSchema = new Schema<IBanner>(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        subtitle: {
            type: String,
            required: true,
            trim: true
        },
        buttonText: {
            type: String,
            required: true,
            trim: true
        },
        image: {
            type: String,
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        order: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

// Create index for faster queries
bannerSchema.index({ isActive: 1, order: 1 });

const Banner = models.Banner || model<IBanner>("Banner", bannerSchema);

export default Banner;