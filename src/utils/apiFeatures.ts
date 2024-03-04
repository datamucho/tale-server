import { Document, Model, Query as MongooseQuery } from "mongoose";

type SortOrder = "asc" | "desc" | "ascending" | "descending" | 1 | -1;

interface Query<T> {
  find: (search?: any) => this;
  sort: (criteria?: string | { [key: string]: SortOrder }) => this;
  select: (fields?: string | string[] | { [key: string]: 0 | 1 }) => this;
  skip: (number: number) => this;
  limit: (number: number) => this;
}

interface QueryString {
  page?: string;
  sort?: string;
  limit?: string;
  fields?: string;
  [key: string]: any;
}
class APIFeatures<T> {
  query: MongooseQuery<T[], T>;
  queryString: QueryString;

  constructor(query: MongooseQuery<T[], T>, queryString: QueryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj: { [key: string]: any } = { ...this.queryString };
    const excludedFields: string[] = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }

    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page ?? "1");
    const limit = parseInt(this.queryString.limit ?? "100");
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

export default APIFeatures;
