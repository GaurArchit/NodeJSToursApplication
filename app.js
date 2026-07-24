const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalError = require('./controller/errorController');
// eslint-disable-next-line import/extensions
const tourRouter = require('./routes/tourRoute');
const userRouter = require('./routes/userRoute');

const app = express();

// MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  console.log('Hello from the middleware 👋');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//Handling Global error Error
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status:'fail',
  //   message:`Cant find ${req.originalUrl} on the server`
  // })//Commented this as I am creting error for the below midleware

  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.status='fail';
  // err.statusCode=404;
  next(new AppError(`Cant find ${req.originalUrl} on the server`, 404));
});

app.use(globalError);
console.log('app.js is loaded and running ');
module.exports = app;
