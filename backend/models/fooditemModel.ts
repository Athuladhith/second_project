import mongoose, { Document, Schema } from 'mongoose';

export interface IFoodItem extends Document {
  name: string;
  price: number;
  quantity: number;
  category: mongoose.Types.ObjectId;
  cuisine: mongoose.Types.ObjectId;
  image: string; 
  restaurant: mongoose.Types.ObjectId// Base64 encoded string or path to the image
  foodType: 'Veg' | 'Non-Veg';
}

const FoodItemSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  category: {
    type: mongoose.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  cuisine: {
    type: mongoose.Types.ObjectId,
    ref: 'Cuisine',
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  restaurant:{
    type:mongoose.Types.ObjectId,
    ref:'Restaurant',
   require:true
  },
  foodType: {
    type: String,
    enum: ['Veg', 'Non-Veg'], // Only allows these two values
    required: true,
  },
 
  
},{
  timestamps: true,
});

const FoodItem = mongoose.model<IFoodItem>('FoodItem', FoodItemSchema);

export default FoodItem;
