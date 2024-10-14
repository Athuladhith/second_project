import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for DeliveryPerson document
interface IDeliveryPerson extends Document {
    name: string;
    email: string;
    phoneNumber: string;
    address: string;
    password: string;
    avatar: string;
    isBlocked:boolean;
    isVerified:boolean;
}

// Create a schema for DeliveryPerson
const deliveryPersonSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        default: 'No avatar provided',
    },
    isBlocked: {
        type: Boolean,
        default: false, // Default to false (not blocked)
      },
      isVerified: {
        type: Boolean,
        default: false, // Default to false (not verified)
      },
}, {
    timestamps: true, // Automatically add createdAt and updatedAt timestamps
});

// Create the model from the schema and export it
const DeliveryPerson = mongoose.model<IDeliveryPerson>('DeliveryPerson', deliveryPersonSchema);

export default DeliveryPerson;