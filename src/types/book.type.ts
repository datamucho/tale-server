import mongoose from "mongoose";

interface IBook {
  name: string;
  audio: string;
  photo: string;
  price: number;
  category: string;
}

export type { IBook };
