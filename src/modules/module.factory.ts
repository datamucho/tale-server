import routerFactory from "../routes/router.factory";
import serviceFactory from "../services/service.factory";
import { ModelType } from "../types";

class moduleFactory {
  model: ModelType<any>;
  service: serviceFactory<Document>;
  router: routerFactory;

  constructor(model: ModelType<any>) {
    this.model = model;
    this.service = new serviceFactory(this.model);
    this.router = new routerFactory(this.service);
  }

  getRouter() {
    return this.router.getRouter();
  }

  getService() {
    return this.service;
  }

  getModel() {
    return this.model;
  }
}

export default moduleFactory;
