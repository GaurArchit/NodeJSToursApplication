class APIFeatures {
  constructor(query, queryString) {
    this.query = query; //Tour.find()
    this.queryString = queryString; //req.query
  }
  // eslint-disable-next-line lines-between-class-members
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);
    console.log('This is line number 33', queryObj);

    //2. ADVANCE FILTERING
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    console.log('This is line number 38', JSON.parse(queryStr));
    this.query = this.query.find(JSON.parse(queryStr));
    console.log('This is in the apiFeatures line number 19 ', this);
    return this; // we use retun this because it return the same object query and queryString in the updated state which can be used by the next function
  }
  // eslint-disable-next-line lines-between-class-members
  sort() {
    if (this.queryString.sort) {
      //Best practice
      const sortBy = this.queryString.sort.split(',').join(' ');
      console.log(sortBy);
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('price');
    }
    return this;
  }
  // eslint-disable-next-line lines-between-class-members
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  // eslint-disable-next-line lines-between-class-members
  pagination() {
    //5 Pagination
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
