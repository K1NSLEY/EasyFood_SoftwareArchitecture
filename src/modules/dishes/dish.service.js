const prisma = require('../../database/prisma');

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function parseId(value) {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw createError('Identificador inválido', 400);
  }
  return id;
}

function validateDish(data) {
  if (typeof data.name !== 'string' || !data.name.trim()) {
    throw createError('Nome do prato é obrigatório', 400);
  }
  if (typeof data.category !== 'string' || !data.category.trim()) {
    throw createError('Categoria do prato é obrigatória', 400);
  }
  if (typeof data.description !== 'string' || !data.description.trim()) {
    throw createError('Descrição do prato é obrigatória', 400);
  }

  const price = Number(data.price);
  if (!Number.isFinite(price) || price < 0) {
    throw createError('Preço inválido', 400);
  }

  return {
    name: data.name.trim(),
    category: data.category.trim(),
    description: data.description.trim(),
    price
  };
}

function ensureOwnership(restaurant, userId) {
  if (restaurant.ownerId !== userId) {
    throw createError('Você não tem permissão para gerenciar este restaurante', 403);
  }
}

async function getDishWithRestaurant(dishId) {
  const id = parseId(dishId);
  const dish = await prisma.dish.findUnique({
    where: { id },
    include: { restaurant: true }
  });
  if (!dish) {
    throw createError('Prato não encontrado', 404);
  }
  return dish;
}

async function getDishForUser(dishId, userId) {
  const dish = await getDishWithRestaurant(dishId);
  ensureOwnership(dish.restaurant, userId);
  return dish;
}

async function createDish(restaurantId, data, userId, imageUrl) {
  const id = parseId(restaurantId);
  const restaurant = await prisma.restaurant.findUnique({ where: { id } });
  if (!restaurant) {
    throw createError('Restaurante não encontrado', 404);
  }
  ensureOwnership(restaurant, userId);

  return prisma.dish.create({
    data: { ...validateDish(data), imageUrl: imageUrl || null, restaurantId: id }
  });
}

async function listDishes(restaurantId) {
  const id = parseId(restaurantId);
  return prisma.dish.findMany({
    where: { restaurantId: id },
    orderBy: { createdAt: 'desc' }
  });
}

async function getDish(dishId) {
  const id = parseId(dishId);
  const dish = await prisma.dish.findUnique({ where: { id } });
  if (!dish) {
    throw createError('Prato não encontrado', 404);
  }
  return dish;
}

async function updateDish(dishId, data, userId, imageUrl) {
  const dish = await getDishWithRestaurant(dishId);
  ensureOwnership(dish.restaurant, userId);

  return prisma.dish.update({
    where: { id: dish.id },
    data: {
      ...validateDish(data),
      ...(imageUrl ? { imageUrl } : {})
    }
  });
}

async function updateDishImage(dishId, userId, imageUrl) {
  const dish = await getDishForUser(dishId, userId);
  return prisma.dish.update({
    where: { id: dish.id },
    data: { imageUrl }
  });
}

async function deleteDish(dishId, userId) {
  const dish = await getDishWithRestaurant(dishId);
  ensureOwnership(dish.restaurant, userId);
  await prisma.dish.delete({ where: { id: dish.id } });
  return dish;
}

module.exports = {
  createDish,
  listDishes,
  getDish,
  getDishWithRestaurant,
  getDishForUser,
  updateDish,
  updateDishImage,
  deleteDish
};
