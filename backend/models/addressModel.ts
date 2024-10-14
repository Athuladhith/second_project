import mongoose, { Document, Schema, Types } from 'mongoose';

// Define the interface for Address document
export interface IAddress extends Document {
  user: Types.ObjectId;  // Reference to the User model
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;  // Whether this address is the default one
}

// Create the schema for Address
const addressSchema: Schema = new Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  street: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  postalCode: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Create the model from the schema and export it
const Address = mongoose.model<IAddress>('Address', addressSchema);

export default Address;
