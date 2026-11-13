const dishService = require('./dish.service');
const activityService = require('../activity/activity.service');
const { writeLog } = require('../../services/logger.service');
const imageService = require('../../services/image.service');

async function recordActivity(userId, action, details) {
  try {
    await activityService.log(userId, action, details);
  } catch (error) {
    writeLog('error', 'Erro ao registrar atividade do prato', { error: error.message });
  }
}

async function removePreviousImage(imageUrl) {
  try {
    await imageService.removeImage(imageUrl);
  } catch (error) {
    writeLog('error', 'Erro ao remover imagem antiga do prato', { error: error.message });
  }
}

async function create(req, res) {
  let imageUrl;
  try {
    imageUrl = req.file ? await imageService.storeImage(req.file) : null;
    const dish = await dishService.createDish(req.params.restaurantId, req.body, req.user.id, imageUrl);
    await recordActivity(req.user.id, 'DISH_CREATED', `Prato: ${dish.name}`);
    return res.status(201).json(dish);
  } catch (error) {
    if (imageUrl) {
      await removePreviousImage(imageUrl);
    }
    return handleError(res, error);
  }
}

async function list(req, res) {
  try {
    return res.json(await dishService.listDishes(req.params.restaurantId));
  } catch (error) {
    return handleError(res, error);
  }
}

async function getById(req, res) {
  try {
    return res.json(await dishService.getDish(req.params.dishId));
  } catch (error) {
    return handleError(res, error);
  }
}

async function update(req, res) {
  let imageUrl;
  try {
    const currentDish = await dishService.getDishWithRestaurant(req.params.dishId);
    imageUrl = req.file ? await imageService.storeImage(req.file) : null;
    const dish = await dishService.updateDish(req.params.dishId, req.body, req.user.id, imageUrl);
    if (imageUrl && currentDish.imageUrl) {
      await removePreviousImage(currentDish.imageUrl);
    }
    await recordActivity(req.user.id, 'DISH_UPDATED', `Prato: ${dish.name}`);
    return res.json(dish);
  } catch (error) {
    if (imageUrl) {
      await removePreviousImage(imageUrl);
    }
    return handleError(res, error);
  }
}

async function updateImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'Selecione uma imagem para o prato' });
  }

  let imageUrl;
  try {
    const currentDish = await dishService.getDishForUser(req.params.dishId, req.user.id);
    imageUrl = await imageService.storeImage(req.file);
    const dish = await dishService.updateDishImage(req.params.dishId, req.user.id, imageUrl);
    if (currentDish.imageUrl) {
      await removePreviousImage(currentDish.imageUrl);
    }
    await recordActivity(req.user.id, 'DISH_IMAGE_UPDATED', `Imagem do prato: ${dish.name}`);
    return res.json(dish);
  } catch (error) {
    if (imageUrl) {
      await removePreviousImage(imageUrl);
    }
    return handleError(res, error);
  }
}

async function remove(req, res) {
  try {
    const dish = await dishService.deleteDish(req.params.dishId, req.user.id);
    await removePreviousImage(dish.imageUrl);
    await recordActivity(req.user.id, 'DISH_DELETED', `Prato: ${dish.name}`);
    return res.status(204).send();
  } catch (error) {
    return handleError(res, error);
  }
}

function handleError(res, error) {
  const status = error.statusCode || 500;
  if (status >= 500) {
    writeLog('error', 'Erro na operação de pratos', { error: error.message });
  }
  return res.status(status).json({
    error: status >= 500 ? 'Erro interno do servidor' : error.message
  });
}

module.exports = { create, list, getById, update, updateImage, remove };
