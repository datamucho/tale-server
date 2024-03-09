import mongoose from "mongoose";

interface IBox {
  id: mongoose.Schema.Types.ObjectId;
  connectedTo: mongoose.Schema.Types.ObjectId;
  bookId: mongoose.Schema.Types.ObjectId;
  isLightOn: boolean;
  paused: boolean;
}

export type { IBox };
