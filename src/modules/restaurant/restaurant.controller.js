const restaurantService = require('./restaurant.service');
const { sendWelcomeEmail, notifyCommercialTeam } = require('../../services/email.service');
const { writeLog } = require('../../services/logger.service');

async function list(req, res) {
  try {
    const restaurants = await restaurantService.listRestaurants();
    res.json(restaurants);
  } catch (error) {
    writeLog('error', 'Erro ao listar restaurantes', { error: error.message });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

async function create(req, res) {
  const { name, email, category, rating } = req.body;

  if (!name || !email || !category) {
    return res.status(400).json({ error: 'Nome, e-mail e categoria são obrigatórios' });
  }

  try {
    const restaurant = await restaurantService.createRestaurant({
      name,
      email,
      category,
      rating
    });

    await Promise.allSettled([
      sendWelcomeEmail(restaurant),
      notifyCommercialTeam(restaurant)
    ]);

    writeLog('info', 'Restaurante cadastrado com sucesso', {
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      restaurantEmail: restaurant.email
    });

    res.status(201).json({
      ...restaurant,
      message: 'Restaurante cadastrado com sucesso.'
    });
  } catch (error) {
    writeLog('error', 'Erro ao cadastrar restaurante', {
      error: error.message,
      name,
      email,
      category
    });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

module.exports = { list, create };
