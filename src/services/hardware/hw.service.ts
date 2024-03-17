import Book from "../../models/book.model";
import Box from "../../models/hardware.model";

// const registerBox = catchAsync(async (req: any, res: any, next: any) => {
//   console.log({ first: "first" });
//   const newBox = await Box.create();
//   console.log({ first: "first" });

//   res.status(201).json({
//     status: "success",
//     data: newBox,
//   });
// });

// export { registerBox, playBook, getBox, pauseBook, getAudio, listenBox };

import AppError from "../../utils/appError";
import catchAsync from "../../utils/catchAsync";

// import filterObj from "../../utils/filterObj";
import serviceFactory from "../service.factory";

class boxService extends serviceFactory<Document> {
  constructor() {
    super(Box);
  }

  playBook = catchAsync(async (req: any, res: any, next: any) => {
    if (!req.params.id || !req.params.bookId) {
      return next(new AppError("Please provide boxId and bookId", 400));
    }

    const box = await Box.findById(req.params.id);

    if (!box) {
      return next(new AppError("No box found with that ID", 404));
    }

    const book = await Book.findById(req.params.bookId);

    if (!book) {
      return next(new AppError("No book found with that ID", 404));
    }

    box.bookId = book._id as any;
    box.paused = false;
    await box.save();

    res.status(200).json({
      status: "success",
      data: box,
    });
  });

  // const getBox = catchAsync(async (req: any, res: any, next: any) => {
  //   const box = await Box.findById(req.params.id);

  //   if (!box) {
  //     return next(new AppError("No box found with that ID", 404));
  //   }

  //   res.status(200).json({
  //     status: "success",
  //     data: {
  //       bookId: box.bookId,
  //       isLightOn: box.isLightOn,
  //       paused: box.paused,
  //     },
  //   });
  // });

  pauseBook = catchAsync(async (req: any, res: any, next: any) => {
    const box = await Box.findById(req.params.id);

    if (!box) {
      return next(new AppError("No box found with that ID", 404));
    }

    if (!box.bookId) {
      return next(new AppError("This box is not playing a book", 400));
    }

    box.paused = !box.paused;
    await box.save();

    res.status(200).json({
      status: "success",
      data: true,
    });
  });

  getAudio = catchAsync(async (req: any, res: any, next: any) => {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return next(new AppError("No book found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: book.audio,
    });
  });

  listenBox = catchAsync(async (req: any, res: any, next: any) => {
    const box = await Box.findById(req.params.id);

    if (!box) {
      return next(new AppError("No box found with that ID", 404));
    }

    const book = await Book.findById(box.bookId);

    if (!book) {
      return next(new AppError("No book found with that ID", 404));
    }

    // const audio =
    //   req.protocol + "://" + req.get("host") + "/request-audio/" + book.audio;
    const audio = "http://stream.srg-ssr.ch/m/rsj/mp3_128";

    const volume = box.volume;

    res.status(200).json({
      status: "success",
      data: { audio, volume },
    });
  });

  toggleLight = catchAsync(async (req: any, res: any, next: any) => {
    const box = await Box.findById(req.params.id);

    if (!box) {
      return next(new AppError("No box found with that ID", 404));
    }

    box.isLightOn = !box.isLightOn;
    await box.save();

    res.status(200).json({
      status: "success",
      data: box,
    });
  });

  updateVolume = catchAsync(async (req: any, res: any, next: any) => {
    const box = await Box.findById(req.params.id);

    if (!box) {
      return next(new AppError("No box found with that ID", 404));
    }

    if (!req.body.volume) {
      return next(new AppError("No volume provided!", 403));
    }

    const volume = req.body.volume;

    if (volume < 0 || volume > 1) {
      return next(new AppError("Invalid Value", 403));
    }

    box.volume = volume;
    await box.save();

    res.status(200).json({
      status: "success",
      data: box,
    });
  });
}

export default boxService;
