import User from "../../models/user.model";
import AppError from "../../utils/appError";
import catchAsync from "../../utils/catchAsync";
import filterObj from "../../utils/filterObj";
import serviceFactory from "../service.factory";

class userService extends serviceFactory<Document> {
  constructor() {
    super(User);
  }

  getMe = (req: any, res: any, next: any) => {
    req.params.id = req.user.id;
    next();
  };

  updateMe = catchAsync(async (req: any, res, next) => {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          "This route is not for password updates. Please use /updateMyPassword.",
          400
        )
      );
    }

    // 2) Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body, "name", "email");

    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
  });

  deleteMe = catchAsync(async (req: any, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
      status: "success",
      data: null,
    });
  });
}

export default userService;
