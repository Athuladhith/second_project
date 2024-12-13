import { Document, model, Schema, Types } from 'mongoose';


export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  isAdmin?: boolean;
  avatar?: string;
  isBlocked: boolean; 
  isVerified: boolean; 
  addresses: Types.ObjectId[]; 
}


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
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  avatar: {
    type: String,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  isVerified: {
    type: Boolean,
    default: false, 
  },
  addresses: [{
    type: Types.ObjectId, 
    ref: 'Address',
  }],
});

const User = model<IUser>('User', userSchema);

export default User;