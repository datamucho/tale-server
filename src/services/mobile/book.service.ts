import { NextFunction, Request, Response } from "express";
import Book from "../../models/book.model";
import serviceFactory from "../service.factory";
import multer, { Multer, StorageEngine, Field } from "multer";
import AppError from "../../utils/appError";
import User from "../../models/user.model";
import catchAsync from "../../utils/catchAsync";

const fileFilter = (req: Request, file: any, cb: any) => {
  if (file.mimetype === "audio/mp3" || file.mimetype === "audio/mpeg") {
    cb(null, true);
  } else {
    cb(new Error("Only .mp3 files are allowed!"), false);
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "audio/");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + ".mp3");
  },
});

class bookService extends serviceFactory<Document> {
  upload: Multer;
  constructor() {
    super(Book);
    this.upload = multer({ storage, fileFilter });
  }

  uploadBook() {
    return this.upload.single("audio");
  }

  uploadAuthorBook = catchAsync(
    async (req: any, res: Response, next: NextFunction) => {
      if (!req.file) {
        return next(new AppError("Please upload an audio file", 400));
      }

      const book = await this.model.create({
        name: req.body.name,
        audio: req.file.filename,
        price: 0,
        category: "author",
        photo: "https://picsum.photos/200/200",
      });

      if (!book) {
        return next(new AppError("Error occured, while adding document!", 404));
      }

      console.log(req.user);
      console.log(req.user.id);

      const user = await User.findById(req.user.id);

      console.log("USERRRR FOUNDED");

      if (!user) {
        return next(new AppError("No user found with that ID", 404));
      }

      user.books.push(book._id);

      await user.save({ validateBeforeSave: false });

      res.status(200).json({ data: book });
    }
  );
}

export default new bookService();
