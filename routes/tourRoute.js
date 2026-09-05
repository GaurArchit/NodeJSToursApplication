const express = require('express');
// eslint-disable-next-line import/extensions
const tourController = require('../controller/tourController');
const authController =require('./../controller/authController')
const router = express.Router();
// router.param('param',(req,res,next,val)=>{
//     console.log(`This is the selected tour ${val}`)
//     next();
// })

// router.param('id', tourController.checkId);
//here param could be anything id or param

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);
//-------------------------------------------------------------------------
//Chaining of middleware functio here in the post request we are first checking the checkbody and then implementing the createTour
router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);
router.route('/lookup-result').get(tourController.getLookup);

router
  .route('/')
  .get(authController.protect,tourController.getAllTours) //Creating procted routes in JWT tokens 
  .post(tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .post(tourController.updateTour)
  .patch(tourController.updateTour)
  .delete(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.deleteTour);

module.exports = router;
