// eslint-disable-next-line prettier/prettier, no-unused-vars
const Tour = require('../models/tourModel');
// eslint-disable-next-line import/extensions
const APIFeatures = require('../utils/apiFeatures.js');
//--------------------Route functions for tours---------------------

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty,duration';
  req.name = 'Testing';
  //console.log('This is my final req.query ', req.query);
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    //Execute the query
    console.log("this is the value of req.query" ,req.query);
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();
    const tours = await features.query;
    res.status(200).json({
      status: 'success',
      resultLength: tours.length,
      data: {
        tours,
        name: req.name, //Undefined values are not send to JSON response
      },
    });
  } catch (err) {
    res.status(404).json({
      message: 'There is no data ',
    });
  }
};

exports.getTour = async (req, res,next) => {
  try {
    console.log(req.params);
    const tourId = await Tour.findById(req.params.id); // This command help us to find data based on the param entered
    //const tourId = await Tour.findOne({ name: req.params.param }); this helps us to find the data that I enter based on the param
    //console.log(tourId);
    res.status(200).json({
      status: 'success',
      data: {
        tourId,
      },
    });
  } catch (err) {
    res.status(400).send('Wrong Id selected');
  }
};
 

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body); // Since we are using here async and await therefore we will not use .then()
    res.status(201).json({
      status: 'Success',
      tour: newTour,
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    //document that we want to update
    const tour = await Tour.findByIdAndUpdate(req.params.param, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      statsu: 'success',
      updatedTour: {
        tour: tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const deletedTour = await Tour.findByIdAndDelete(req.params.param);
    const finalTourCount = await Tour.find();
    console.log(deletedTour);
    console.log(finalTourCount);
    res.status(200).json({
      status: 'success',
      data: {
        tour: finalTourCount,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err,
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
    //agrigated pipelines
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: {
          avgPrice: 1,
        },
      },
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err,
    });
  }
};
//Calculate the busiest tour of the month

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1; //2021
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTours: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: { numTours: 1 },
      },
      {
        $limit: 13,
      },
    ]);
    res.status(200).json({
      status: 'success',
      resultlength: plan.length,
      year: year,
      data: {
        plan,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err,
    });
  }
};

exports.getLookup = async (req, res) => {
  try {
    console.log('This is the router to check if it works or middleware');
    const dataresult = await Tour.aggregate([
      {
        $lookup: {
          from: 'lookups',
          localField: 'name',
          foreignField: 'name',
          as: 'lookupresult',
        },
      },
      {
        $unwind: '$lookupresult',
      },
      {
        $project: {
          lookupresult: {
            summary: '$lookupresult.summary',
          },
          name: 1,
          duration: 1,
        },
      },
    ]);
    res.status(200).json({
      status: 'suceess',
      result: dataresult.length,
      data: {
        dataresult,
        time: req.requestTime, //check in app.js where inside the middeware where it is defined
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err,
    });
  }
};
