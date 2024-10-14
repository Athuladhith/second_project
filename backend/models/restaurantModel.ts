import mongoose, { Document, Schema } from 'mongoose';

export interface IRestaurant extends Document {
  _id: mongoose.Types.ObjectId; // Add this line
  restaurantName: string;
  ownerName: string;
  email: string;
  phoneNumber: string;
  address: string;
  password: string; // Hashed password
  avatar: string; // Base64 encoded string or path to avatar image
  isBlocked: boolean;
  isVerified: boolean;
}

const RestaurantSchema: Schema = new Schema({
  restaurantName: {
    type: String,
    required: true,
  },
  ownerName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
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
});

const Restaurant = mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);

export default Restaurant;
