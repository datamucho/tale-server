import { NextFunction, Request, Response } from "express";
import Book from "../../models/book.model";
import serviceFactory from "../service.factory";
import multer, { Multer, StorageEngine, Field } from "multer";
import AppError from "../../utils/appError";
import User from "../../models/user.model";
import catchAsync from "../../utils/catchAsync";
import { getBogAccessToken, initiateBogPay } from "../../bog";
import { initiateBogPayResponse } from "../../types/bog.types";
import { successPage } from "../../pages";
import { errorPage } from "../../pages/error.page";

const fileFilter = (req: Request, file: any, cb: any) => {
  if (
    file.mimetype === "audio/mp3" ||
    file.mimetype === "audio/mpeg" ||
    file.mimetype === "audio/x-m4a" ||
    file.mimetype === "audio/m4a" ||
    file.mimetype === "audio/mp4"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only .mp3 files are allowed!"), false);
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "dist/audio/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + `.${file.mimetype.split("/")[1]}`
    );
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

      const user = await User.findById(req.user.id);

      if (!user) {
        return next(new AppError("No user found with that ID", 404));
      }

      user.books.push(book._id);

      await user.save({ validateBeforeSave: false });

      res.status(200).json({ data: book });
    }
  );

  uploadGeneralBook = catchAsync(
    async (req: any, res: Response, next: NextFunction) => {
      console.log("you");
      console.log(req);
      if (!req.file) {
        return next(new AppError("Please upload an audio file", 400));
      }

      console.log("damn");

      const book = await this.model.create({
        name: req.body.name,
        audio: req.file.filename,
        price: req.body.price,
        category: req.body.category,
        photo: req.body.photo,
      });

      if (!book) {
        return next(new AppError("Error occured, while adding document!", 404));
      }

      res.status(200).json({ data: book });
    }
  );

  buyBook = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const bogToken = await getBogAccessToken();

    if (!bogToken) {
      return next(new AppError("Error occured, while getting token!", 404));
    }

    const book = await this.model.findById(req.params.id);

    if (!book) {
      return next(new AppError("No document found with that ID", 404));
    }

    const successUrl = `${req.protocol}://${req.get(
      "host"
    )}/books/payment/success`;
    const errorUrl = `${req.protocol}://${req.get("host")}/books/payment/error`;

    const callback = `https://${req.get("host")}/books/payment/callback`;

    const proccedToPayment = await initiateBogPay(
      bogToken,
      book._id,
      req.user.id,
      book.price,
      callback,
      successUrl,
      errorUrl
    );

    if (!proccedToPayment) {
      return next(
        new AppError("Error occured, while proceeding to payment!", 404)
      );
    }

    console.log(proccedToPayment);

    return res.status(200).json({ data: proccedToPayment });
  });

  handlePaymentCallback = catchAsync(
    async (req: any, res: Response, next: NextFunction) => {
      console.log("wasssupiiiiiiii");
      console.log(JSON.stringify(req.body));
      // const book = await this.model.findById(req.params.bookId);

      // if (!book) {
      //   return next(new AppError("No document found with that ID", 404));
      // }

      // const user = await User.findById(req.params.userId);

      // if (!user) {
      //   return next(new AppError("No user found with that ID", 404));
      // }

      // if (user.books.includes(book._id)) {
      //   return next(new AppError("You already have this book", 400));
      // }

      // user.books.push(book._id);

      // await user.save({ validateBeforeSave: false });
      // console.log("200 cb");

      res.status(200).send({ success: true });
    }
  );

  handlePaymentError = (req: Request, res: Response, next: NextFunction) => {
    res.send(errorPage);
  };

  handlePaymentSuccess = (req: Request, res: Response, next: NextFunction) => {
    res.send(successPage);
  };
  getMyBooks = catchAsync(
    async (req: any, res: Response, next: NextFunction) => {
      let freeBooks = await this.model.find({ price: 0 });
      freeBooks = freeBooks.filter((book) => book.category !== "author");
      const userBooks = await User.findById(req.user.id).populate("books");

      if (!userBooks) {
        return next(new AppError("No user found with that ID", 404));
      }

      let books = [...freeBooks, ...userBooks.books];
      const bookIds = new Set(books.map((book) => book._id));

      books = books.filter((book) => {
        if (bookIds.has(book._id)) {
          bookIds.delete(book._id);
          return true;
        }
        return false;
      });

      res.status(200).json({ data: books });
    }
  );

  uploadBookGeneral = catchAsync(
    async (req: any, res: Response, next: NextFunction) => {
      if (!req.file) {
        return next(new AppError("Please upload an audio file", 400));
      }

      const book = await this.model.create({
        name: req.body.name,
        audio: req.file.filename,
        price: req.body.price,
        category: req.body.category,
        photo: req.body.photo,
      });

      if (!book) {
        return next(new AppError("Error occured, while adding document!", 404));
      }

      const user = await User.findById(req.user.id);

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
