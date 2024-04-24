import bookService from "../services/mobile/book.service";
import routerFactory from "./router.factory";

class bookRouter extends routerFactory {
  constructor() {
    super(bookService);
    this.router.post(
      "/mine",
      this.service.uploadBook(),
      this.service.uploadAuthorBook
    );
  }
}

export default new bookRouter().router;
