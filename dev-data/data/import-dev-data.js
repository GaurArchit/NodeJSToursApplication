const fs = require('fs');

const mongoose = require('mongoose');

const dotenv = require('dotenv');

const Tour = require('../../models/tourModel');

dotenv.config({ path: './config.env' });

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

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf8'),
);

//IMPORT data into dataBse

const imporData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data successfully added');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
// Delete All Data from colledtion
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data successfully deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  imporData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
// console.log(process.argv);
