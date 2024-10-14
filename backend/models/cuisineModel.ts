import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for Cuisine document
interface ICuisine extends Document {
    name: string;
    description: string;
    avatar: string;
}

// Create a schema for Cuisine
const cuisineSchema: Schema = new Schema({
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
const Cuisine = mongoose.model<ICuisine>('Cuisine', cuisineSchema);

export default Cuisine;
