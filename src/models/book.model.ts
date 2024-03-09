import mongoose, { Schema, Document, Query } from "mongoose";
import validator from "validator";
import { IBook } from "../types";

const bookSchema = new Schema<IBook>({
  name: {
    type: String,
    required: [true, "Please tell us your name!"],
  },
  audio: {
    type: String,
    required: [true, "Please provide your audio"],
    unique: true,
  },
  photo: {
    type: String,
    required: [true, "Please provide your photo"],
    validate: [validator.isURL, "Please provide a valid photo"],
  },
  price: {
    type: Number,
    required: [true, "Please provide your price"],
  },
  category: {
    type: String,
    required: [true, "Please provide your category"],
  },
});

const Book = mongoose.model<IBook>("Book", bookSchema);

export default Book;
