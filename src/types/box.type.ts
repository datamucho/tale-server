import mongoose from "mongoose";

interface IBox {
  id: mongoose.Schema.Types.ObjectId;
  boxId: string;
  connectedTo?: mongoose.Schema.Types.ObjectId;
  bookId?: mongoose.Schema.Types.ObjectId;
  isLightOn?: boolean;
  paused?: boolean;
  volume?: number;
}

export type { IBox };
