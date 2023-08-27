const Movie = require("../Models/movieModel");

class ApiFeatures {
  constructor(query, queryObj) {
    this.query = query;
    this.queryObj = queryObj;
  }

  filter() {
    const props = ["sort", "fields", "page", "limit"];

    let queryObjStr = JSON.stringify(this.queryObj);
    queryObjStr = queryObjStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => {
      return `$${match}`;
    });
    const newQueryObj = JSON.parse(queryObjStr);

    for (const prop in newQueryObj) {
      if (props.includes(prop)) {
        delete newQueryObj[prop];
      }
    }

    this.query = this.query.find(newQueryObj);

    return this;
  }

  sort() {
    if (this.queryObj.sort) {
      const sortBy = this.queryObj.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createAt");
    }
    return this;
  }

  limitFields() {
    if (this.queryObj.fields) {
      const fields = this.queryObj.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  paginate() {
    const page = this.queryObj.page * 1 || 1;
    const limit = this.queryObj.limit * 1 || 50;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    // if (this.queryObj.page) {
    //   const moviesCount = Movie.countDocuments();
    //   if (skip >= moviesCount) {
    //     throw new Error("This page is not found!");
    //   }
    // }

    return this;
  }
}

module.exports = ApiFeatures;
