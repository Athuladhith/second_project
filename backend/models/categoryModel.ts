import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for Category document
interface ICategory extends Document {
    name: string;
    description: string;
    avatar: string;
}

// Create a schema for Category
const categorySchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        default: 'No avatar provided',
    },
}, {
    timestamps: true, // Automatically add createdAt and updatedAt timestamps
});

// Create the model from the schema and export it
const Category = mongoose.model<ICategory>('Category', categorySchema);

export default Category;
