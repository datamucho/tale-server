import Book from "../../models/book.model";
import serviceFactory from "../service.factory";

const bookService = new serviceFactory(Book);
export default bookService;
