import express from "express";
import serviceFactory from "../services/service.factory";
import { protect, restrictTo } from "../services/mobile/auth.service";

interface routeOptions {
  restrictGet?: boolean;
  restrictPost?: boolean;
}

class routerFactory {
  router: express.Router;
  service: serviceFactory<Document>;

  constructor(service: serviceFactory<Document>, options: routeOptions) {
    this.router = express.Router();
    this.service = service;
    this.router.use(protect);
    if (options.restrictGet) {
      this.router.use(restrictTo("admin"));
    }
    this.router.get("/", service.getAll);
    this.router.get("/:id", service.getOne);
    if (options.restrictPost) {
      this.router.use(restrictTo("admin"));
    }
    this.router.post("/", service.createOne);
    this.router.patch("/:id", service.updateOne);
    this.router.delete("/:id", service.deleteOne);
  }

  getRouter() {
    return this.router;
  }
}

export default routerFactory;
