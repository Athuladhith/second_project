import mongoose, { Document, Schema } from 'mongoose';


export interface IDeliveryPerson extends Document {
    _id:string;
    name: string;
    email: string;
    phoneNumber: string;
    address: string;
    password: string;
    avatar: string;
    isBlocked:boolean;
    isVerified:boolean;
}


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
        default: false,
      },
      isVerified: {
        type: Boolean,
        default: false, 
      },
}, {
    timestamps: true, 
});


const DeliveryPerson = mongoose.model<IDeliveryPerson>('DeliveryPerson', deliveryPersonSchema);

export default DeliveryPerson;