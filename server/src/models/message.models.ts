import mongoose, { Schema, Document, type Types } from "mongoose";

export interface IMessage extends Document {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  conversationId: Types.ObjectId;
  room: string;
  content: string;
  type: string;
  status: string;
  isRead?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    room: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["text", "image", "video", "file"],
      default: "text",
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(_document, returnedObject: Record<string, any>) {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
      },
    },
  },
);

messageSchema.index({
    conversationId:1,
    createdAt:-1
});

const Message = mongoose.model<IMessage>("Message", messageSchema);
export default Message;
