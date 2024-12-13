


import mongoose, { Document, Schema, Model } from 'mongoose';

interface IConversation extends Document {
  restaurantId: string;
  userId: string;
}

const ConversationSchema: Schema = new Schema(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const Conversation: Model<IConversation> = mongoose.model<IConversation>('Conversation', ConversationSchema);

export default Conversation;
export { IConversation };
