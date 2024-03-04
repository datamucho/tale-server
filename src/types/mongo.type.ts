import { Model } from "mongoose";

interface ModelType<T extends Document> extends Model<T> {}
export { ModelType };
