import express from "express";
import hardwareController from "../services/hardware/hw.service";

const router = express.Router();

const controller = new hardwareController();

router.post("/", controller.createOne);

router.patch("/play/:id/:bookId", controller.playBook);
router.get("/:id", controller.getOne);
router.patch("/pause/:id", controller.pauseBook);
router.get("/audio/:id", controller.getAudio);
router.get("/listen/:id", controller.listenBox);
router.get("/light/:id", controller.toggleLight);

export default router;
