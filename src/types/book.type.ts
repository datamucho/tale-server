import mongoose from "mongoose";

interface IBook {
  id: mongoose.Schema.Types.ObjectId;
  name: string;
  nameGe: string;
  nameRu: string;
  audio: string;
  photo: string;
  price: number;
  category: string;
  duration: number;
}

export type { IBook };
