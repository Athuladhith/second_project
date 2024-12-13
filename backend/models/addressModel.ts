import mongoose, { Document, Schema, Types } from 'mongoose';


export interface IAddress extends Document {
  user: Types.ObjectId; 
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean; 
}


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

const Address = mongoose.model<IAddress>('Address', addressSchema);

export default Address;
