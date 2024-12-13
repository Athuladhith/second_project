import mongoose, { Document, Schema } from 'mongoose';


interface ICuisine extends Document {
    name: string;
    description: string;
    avatar: string;
}


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
    timestamps: true, 
});


const Cuisine = mongoose.model<ICuisine>('Cuisine', cuisineSchema);

export default Cuisine;
