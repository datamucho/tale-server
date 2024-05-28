import { protect } from "../services/mobile/auth.service";
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
    this.router.get("/buyed/my", protect, this.service.getMyBooks);

    this.router.post("/buy/:id", protect, this.service.buyBook);
    this.router.get(
      "/payment/callback/:bookId/:userId",
      this.service.handlePaymentCallback
    );
    this.router.get("/payment/success", this.service.handlePaymentSuccess);
    this.router.get("/payment/error", this.service.handlePaymentError);
  }
}

export default new bookRouter().router;
