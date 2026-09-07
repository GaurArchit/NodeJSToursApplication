const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto =require('crypto')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
  },
  email: {
    type: String,
    required: [true, 'A user must have a email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  password: {
    type: String,
    require: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    require: [true, 'Please confirm your password'],
    validate: {
      //this only works on  Create and SAVE
      validator: function (el) {
        return el === this.password;
      },
    },
  },
  role:{
    type:String,
    enum:['user','guide','lead-guide','admin'],
    default:'user'
  },
  passwordChangedAT: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});


//When ever a user is saved or created
userSchema.pre('save',function(next){
  if(!this.isModified('password')||this.isNew)
    return next();
  this.passwordChangedAT=Date.now();
  next();
})

//Document middleware before  saving the data
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  //hash the password the cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  //delete he password confrim field
  this.passwordConfirm = undefined;
  next();
});


userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.changedPasswordAfter= function(JWTTImestamp){
  if(this.passwordChangedAT){
    const changedTimeStamp= parseInt(this.passwordChangedAT.getTime()/1000);
    console.log("This is inside the usermodule line 56",JWTTImestamp,changedTimeStamp,JWTTImestamp<changedTimeStamp)
    return JWTTImestamp<changedTimeStamp;
  }
}

userSchema.methods.createPasswordResetToken=function(){
  const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken=crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires=Date.now()+10*60*1000;
    console.log({resetToken},this.passwordResetToken);
    return resetToken;
}

const User = mongoose.model('users', userSchema);

module.exports = User;
