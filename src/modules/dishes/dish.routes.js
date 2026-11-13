const express = require('express');
const controller = require('./dish.controller');
const authenticate = require('../auth/auth.middleware');
const { uploadImage } = require('../../services/upload.middleware');

const router = express.Router();

router.post('/restaurants/:restaurantId/dishes', authenticate, uploadImage, controller.create);
router.get('/restaurants/:restaurantId/dishes', controller.list);
router.get('/dishes/:dishId', controller.getById);
router.post('/dishes/:dishId/image', authenticate, uploadImage, controller.updateImage);
router.put('/dishes/:dishId', authenticate, uploadImage, controller.update);
router.delete('/dishes/:dishId', authenticate, controller.remove);

module.exports = router;
