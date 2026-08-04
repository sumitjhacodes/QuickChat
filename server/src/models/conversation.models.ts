import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IConversation extends Document {
  participants: Types.ObjectId[];
  type: "private" | "group";
  name?: string;
  createdBy: Types.ObjectId;
  lastMessage?: Types.ObjectId | null;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    type: {
      type: String,
      enum: ["private", "group"],
      default: "private",
    },
    name: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

conversationSchema.index({ participants: 1, updatedAt: -1 });

const Conversation = mongoose.model<IConversation>(
  "Conversation",
  conversationSchema,
);
export default Conversation;
