const jwt = require('jsonwebtoken');
const { promisify } = require('util');;
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.signup = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAT: req.body.passwordChangedAT
  });
  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(201).json({
    status: 'Success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1. Check if email and password exits
  if (!email || !password) {
    return next(new AppError('Please provide email and password'));
  }
  //2. Check if user exits && Password is correct
  const user = await User.findOne({ email }).select('+password');
  //console.log(user);

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  //3.if everything ok,send token to client
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  res.status(200).json({
    status: 'success',
    id: user._id,
    token,
  });
});


exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);
//3. check if the user still exits 
const frshUser=await User.findById(decoded.id);
if(!frshUser){
  return next(new AppError('User no longer exist' ,401));
}
// 4. check if user change password after JWT issued
 if(frshUser.changedPasswordAfter(decoded.iat)) {
  return next(new AppError('User changed passpwrd please log in again ',401));
 };

 //Grant access to the protected route 
  next();
})