/* eslint-disable import/order */

const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require('mongoose');
const app = require('./app');

console.log(app.get('env'));

const port = process.env.PORT;

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    // eslint-disable-next-line no-undef
    dbName: 'tours',
  })
  .then(() => {
    console.log('✅ Database connection successful');
  })
  .catch((error) => {
    console.log(`❌ Database error: ${error}`);
  });

// const tourSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'A tour must have a name'],
//     unique: true,
//   },
//   rating: Number,
//   price: {
//     type: Number,
//     required: [true, 'A tour must have a price'],
//   },
// });
// const Tour = mongoose.model('Tour', tourSchema);

// const testTour = new Tour({
//   name: 'rtretertretet ',
//   rating: 4.7,
//   price: 497,
// });

// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

// Tour.create({
//   name: 'Method 2 to save',
//   price: 500,
//   rating: 6.7,
// })
//   .then(() => {
//     console.log('Data has been');
//   })
//   .catch((err) => {
//     console.log(`data is not saved ${err}`);
//   });

app.listen(port, () => {
  console.log(`🚀 App running on port ${port}`);
});
//Testing node js debug
