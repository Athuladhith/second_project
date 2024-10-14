import { Document, model, Schema, Types } from 'mongoose';

// Define the IUser interface to represent the user document
export interface IUser extends Document {
  _id: Types.ObjectId; // Explicitly define _id as ObjectId
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  isAdmin?: boolean;
  avatar?: string; // Add avatar field
  isBlocked: boolean; // Add isBlocked field
  isVerified: boolean; // Add isVerified field
  addresses: Types.ObjectId[]; // Define addresses as an array of ObjectIds
}

// Define the schema for the user model
const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String, // Store phone number as a string
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  avatar: {
    type: String, // Store avatar as a base64 string or URL
  },
  isBlocked: {
    type: Boolean,
    default: false, // Default to false (not blocked)
  },
  isVerified: {
    type: Boolean,
    default: false, // Default to false (not verified)
  },
  addresses: [{
    type: Types.ObjectId, // Use Types.ObjectId for referencing Address model
    ref: 'Address',
  }],
});

// Create the model from the schema
const User = model<IUser>('User', userSchema);

export default User; // Export the User model
