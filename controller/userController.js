//------------------------------Middle ware function
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');


const filterObj =(obj,...allowedFileds)=>{
  const newObj={}
  Object.keys(obj).forEach(el=>{
    if(allowedFileds.includes(el)) newObj[el]=obj[el]
  })
  return newObj
}

exports.getAlluser = (req, res) => {
  res.status(500).json({
    status: 'not yet updated',
    message: 'This route is not impletmented yet ',
  });
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'not yet updated',
    message: 'This route is not impletmented yet ',
  });
};

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'not yet updated',
    message: 'This route is not impletmented yet ',
  });
};

exports.updateMe= catchAsync(async(req,res,next)=>{
 //1. Create error if user Post password data.
 if(req.body.password || req.body.passwordConfirm){
  return next(new AppError("This is not the route to update password",400))
 }
 //2.Filter out unwanted fields name that are not required
 const filterBody =filterObj(req.body,'name','email');
 //3, Update the user document 
const updatedUser =await User.findByIdAndUpdate(req.user.id,filterBody,{new:true,runValidators:true});


res.status(200).json({
  statu:"Success",
  data:{
    user:updatedUser
  }
})

})
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'not yet updated',
    message: 'This route is not impletmented yet ',
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'not yet updated',
    message: 'This route is not impletmented yet ',
  });
};

//----------------------------------------
