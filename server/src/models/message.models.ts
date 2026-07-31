import mongoose, { Schema, Document, type Types } from "mongoose";

export interface IMessage extends Document {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  room: string;
  content: string;
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
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(document, returnedObject) {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
      },
    },
  },
);

const Message = mongoose.model<IMessage>("Message", messageSchema);
export default Message;
