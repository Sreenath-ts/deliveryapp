import { Schema, model, models } from "mongoose";

export interface IBanner {
    type: 'image' | 'text';
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink?: string;
    badge?: string;
    image?: string;
    bgGradient?: string;
    textColor?: 'white' | 'dark';
    isActive: boolean;
    order: number;
}

const bannerSchema = new Schema<IBanner>(
    {
        type: {
            type: String,
            enum: ['image', 'text'],
            default: 'image'
        },
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
            trim: true,
            default: null
        },
        buttonLink: {
            type: String,
            trim: true,
            default: null
        },
        badge: {
            type: String,
            trim: true,
            default: null
        },
        image: {
            type: String,
            default: null
        },
        bgGradient: {
            type: String,
            default: null
        },
        textColor: {
            type: String,
            enum: ['white', 'dark'],
            default: 'white'
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
    { timestamps: true }
);

bannerSchema.index({ isActive: 1, order: 1 });

const Banner = models.Banner || model<IBanner>("Banner", bannerSchema);

export default Banner;
