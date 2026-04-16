import mongoose from "mongoose";

export interface ICategory {
    _id?: mongoose.Types.ObjectId,
    name: string,
    icon: string,
    gradient: string,
    enabled: boolean,
    createdAt?: Date,
    updatedAt?: Date
}

const categorySchema = new mongoose.Schema<ICategory>({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    icon: {
        type: String,
        required: true,
        default: "Box"
    },
    gradient: {
        type: String,
        required: true,
        default: "from-green-400 to-emerald-500"
    },
    enabled: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
})

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema)
export default Category
