const express = require('express');
const cors = require('cors');
const path = require('path');
const { writeLog } = require('./services/logger.service');
const authRoutes = require('./modules/auth/auth.routes');
const restaurantRoutes = require('./modules/restaurant/restaurant.routes');
const dishRoutes = require('./modules/dishes/dish.routes');
const activityRoutes = require('./modules/activity/activity.routes');

const app = express();
const projectRoot = path.join(__dirname, '..');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(projectRoot, 'public')));

app.use('/auth', authRoutes);
app.use('/restaurants', restaurantRoutes);
app.use(dishRoutes);
app.use('/activity', activityRoutes);

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : (error.statusCode || error.status || 500);
  if (status >= 500) {
    writeLog('error', 'Erro ao processar requisição', { error: error.message });
  }
  res.status(status).json({
    error: status === 413 ? 'A imagem deve ter no máximo 5 MB' :
      (status >= 500 ? 'Erro interno do servidor' : error.message)
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(projectRoot, 'public', 'index.html'));
});

writeLog('info', 'Aplicação configurada');

module.exports = app;
