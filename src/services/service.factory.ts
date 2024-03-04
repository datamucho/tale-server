import catchAsync from "../utils/catchAsync";
import AppError from "../utils/appError";
import APIFeatures from "../utils/apiFeatures";
import { ModelType } from "../types";

class serviceFactory<T extends Document> {
  model: ModelType<any>;
  constructor(model: ModelType<any>) {
    this.model = model;
  }

  deleteOne = catchAsync(async (req, res, next) => {
    const doc = await this.model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  });

  updateOne = catchAsync(async (req, res, next) => {
    const doc = await this.model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

  createOne = catchAsync(async (req, res, next) => {
    const doc = await this.model.create(req.body);

    if (!doc) {
      return next(new AppError("Error occured, while adding document!", 404));
    }

    res.status(201).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

  getOne = catchAsync(async (req, res, next) => {
    let query = this.model.findById(req.params.id);
    const doc = await query;

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

  getAll = catchAsync(async (req, res, _) => {
    let filter = {};
    const features = new APIFeatures<T>(this.model.find(filter), req.query);
    const doc = await features.query;

    res.status(200).json({
      status: "success",
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
}

export default serviceFactory;
