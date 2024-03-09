import mongoose, { Schema } from "mongoose";
import { IBox } from "../types";

const BoxSchema = new Schema<IBox>({
  connectedTo: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  bookId: {
    type: Schema.Types.ObjectId,
    ref: "Book",
    default: null,
  },
  isLightOn: {
    type: Boolean,
    default: false,
  },
  paused: {
    type: Boolean,
    default: false,
  },
});

const Box = mongoose.model<IBox>("Box", BoxSchema);

export default Box;
