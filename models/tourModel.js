const mongoose = require('mongoose');
const slugify=require('slugify');
const validator=require('validator');
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true,
    validator:validator.isAlpha
     // npm validator method 
    
  },
  slug:String,
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'Atour must have a group size'],
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty'],
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
  priceDiscount: { // This is an example of custome validator 
    type: Number,
    validate: {
      validator:function(val){
      return val <this.price
    },
    message:'Discount price value shpuld be below regular price '
    }
  },
  summary: {
    type: String,
    trim: true,
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a cover image'],
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  startDates: [Date],
  secretTour:{
    type:Boolean,
    default: false,
  }
},{
  toJSON :{virtuals :true}
});
//DOcument middle ware : runs before .save() and .create() 
// tourSchema.pre('save',function(next){
//   //console.log(this)// here this will get the current document which is being set 
//   this.slug= slugify(this.name,{lower:true});
//   next();

// });

// tourSchema.pre('save',function(next){
//   console.log('will save document ...');
//   next();
// })
// tourSchema.post('save',function(doc,next){
//   console.log(doc);
//   next();
// })

//Query Middleware

// tourSchema.pre(/^find/,function(next){
//   // tourSchema.pre('find',function(next)
//   this.find({secretTour :{$eq :true}}) // The output of this will be shown once the route is completed 
//   this.start=Date.now();
//   next(); // here the this keyword will point towards this query not the data 
// })

// tourSchema.post(/^find/,function(docs,next){
//   console.log(docs);
//   console.log(`Query took ${Date.now()-this.start} millisecond`)
//   next();
// })


tourSchema.virtual('duarationWeek').get(function(){
   return this.duration/7; // Here the this keyword points to the current schema document it is not present in arrow funtion
 });
 
const Tour = mongoose.model('tour', tourSchema); //Here 'tour' means collection name

module.exports = Tour;
