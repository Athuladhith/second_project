import mongoose, { Document, Schema } from 'mongoose';


interface ICategory extends Document {
    name: string;
    description: string;
    avatar: string;
}


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
    timestamps: true, 
});

const Category = mongoose.model<ICategory>('Category', categorySchema);

export default Category;
