import { Schema, model, Document, Types } from 'mongoose';

// Define an interface for Conversation Document
interface IConversation extends Document {
  restaurantId: Types.ObjectId;
  userId: Types.ObjectId;
  createdAt: Date;
}

// Define the schema with types
const conversationSchema = new Schema<IConversation>({
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

// Create the model from the schema
const Conversation = model<IConversation>('Conversation', conversationSchema);

export default Conversation;