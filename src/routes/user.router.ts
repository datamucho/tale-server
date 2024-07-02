// ES6 import statements
import express from "express";
import userService from "../services/mobile/user.service";
import * as authController from "../services/mobile/auth.service";

const router = express.Router();

// Adding route handlers with assumed types from authController and userService
router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.get("/logout", authController.logout);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

// Protect all routes after this middleware
router.use(authController.protect);

const userController = new userService();

router.get("/checkAuth", authController.checkValidToken);
router.patch("/updateMyPassword", authController.updatePassword);
router.get("/me", userController.getMe, userController.getOne);
router.patch("/updateMe", userController.updateMe);
router.delete("/deleteMe", userController.deleteMe);

router.use(authController.restrictTo("admin"));

router.route("/").get(userController.getAll).post(userController.createOne);

router
  .route("/:id")
  .get(userController.getOne)
  .patch(userController.updateOne)
  .delete(userController.deleteOne);

export default router;
