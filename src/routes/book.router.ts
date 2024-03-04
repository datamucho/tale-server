import bookService from "../services/mobile/book.service";
import routerFactory from "./router.factory";

const router = new routerFactory(bookService).router;
export default router;
