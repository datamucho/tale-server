import mongoose from "mongoose";

interface IBook {
  id: mongoose.Schema.Types.ObjectId;
  name: string;
  audio: string;
  photo: string;
  price: number;
  category: string;
}

export type { IBook };
