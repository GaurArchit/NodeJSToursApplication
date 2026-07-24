/* eslint-disable import/extensions */
const express = require('express');
const authController = require('../controller/authController.js');

const router = express.Router();
// eslint-disable-next-line prettier/prettier
const userController = require("../controller/userController.js");

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router
  .route('/')
  .get(userController.getAlluser)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
