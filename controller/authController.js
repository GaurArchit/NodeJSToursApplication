const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

exports.signup = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
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
      new AppError('You are not logged in! Please log in to get access.', 401),
    );
  }
  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);
  //3. check if the user still exits
  const frshUser = await User.findById(decoded.id);
  if (!frshUser) {
    return next(new AppError('User no longer exist', 401));
  }
  // 4. check if user change password after JWT issued
  if (frshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User changed password please log in again ', 401),
    );
  }
  //Grant access to the protected route
  req.user = frshUser; //By this we are sending the fresh user value to the entire middle ware
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles [admin,lead-guide] we use rest operator here roles which takes argument example .restrictTo('admin','lead-guide')
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Only admin or lead-guide can delete', 403));
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1. Get use email from post request
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address', 404));
  }
  //2. Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //3. Send it to user email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const messsage = `Forgot your password? Submit a PATCH request with your new password and password confirmation to ${resetURL}`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your Password Reset token valid only 10 min ',
      message: messsage,
    });
    res.status(200).json({
      status: 'succes',
      message: 'Token sent to email ',
    });
  } catch (err) {
    console.error('Email sending failed:', err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('There was an error sending the message', 500));
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  //1.get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if(!user){
    return new(new AppError('Token has expired'));
  }
  user.password=req.body.password;
  user.passwordConfirm=req.body.passwordConfirm;
  user.passwordResetToken=undefined;
  user.passwordResetExpires=undefined;
  await user.save();
  //2. If token has not expired and there is user ,set the new password
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(200).json({
    status:"Success",
    token
  })
  //3. Update changedPassowordAT property for the user
});
exports.updatePassword=catchAsync(async(req,res,next)=>{
  // 1. Get the authenticated user with the stored password.
  console.log(req.user)

  const user = await User.findById(req.user.id).select('+password');
  // 2. Check whether the current password is correct.
  if (!user || !(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is incorrect', 401));
  }

  // 3. Set the new values; save middleware hashes the password and updates
  // passwordChangedAT.
  user.password = req.body.passwordNew;
  user.passwordConfirm = req.body.passwordConfirmNew;
  await user.save();

  // 4. Log the user in again with a new JWT.
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(200).json({
    status: 'success Password has been updated',
    token,
  });
});