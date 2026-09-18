const prisma = require('../../database/prisma');

async function listRestaurants() {
  return prisma.restaurant.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

async function createRestaurant(data) {
  return prisma.restaurant.create({
    data: {
      name: data.name,
      email: data.email,
      category: data.category,
      rating: Number(data.rating) || 0
    }
  });
}

module.exports = { listRestaurants, createRestaurant };
