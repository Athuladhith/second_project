import mongoose, { Document, Schema } from 'mongoose';

export interface IRestaurant extends Document {
  _id: mongoose.Types.ObjectId; 
  restaurantName: string;
  ownerName: string;
  email: string;
  phoneNumber: string;
  address: string;
  password: string;
  avatar: string;
  isBlocked: boolean;
  isVerified: boolean;
  reports: IReport[];

}

export interface IReport {
  userId: mongoose.Types.ObjectId;
  reportedAt: Date;
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
  reports: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reportedAt: { type: Date, default: Date.now },
    },
  ]
});

const Restaurant = mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);

export default Restaurant;
