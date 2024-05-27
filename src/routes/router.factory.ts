import express from "express";
import serviceFactory from "../services/service.factory";
import { protect, restrictTo } from "../services/mobile/auth.service";

interface routeOptions {
  restrictGet?: boolean;
  restrictPost?: boolean;
  protectAll?: boolean;
}

class routerFactory {
  router: express.Router;
  service: any | serviceFactory<Document>;

  constructor(service: serviceFactory<Document>, options?: routeOptions) {
    this.router = express.Router();
    this.service = service;
    options?.protectAll && this.router.use(protect);
    if (options?.restrictGet) {
      this.router.use(restrictTo("admin"));
    }
    this.router.get("/", protect, service.getAll);
    this.router.get("/:id", protect, service.getOne);
    if (options?.restrictPost) {
      this.router.use(restrictTo("admin"));
    }
    this.router.post("/", protect, service.createOne);
    this.router.patch("/:id", protect, service.updateOne);
    this.router.delete("/:id", protect, service.deleteOne);
  }

  getRouter() {
    return this.router;
  }
}

export default routerFactory;
