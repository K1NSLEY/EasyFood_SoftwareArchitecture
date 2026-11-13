const activityService = require('./activity.service');
const { writeLog } = require('../../services/logger.service');

async function list(req, res) {
  try {
    return res.json(await activityService.listForUser(req.user.id));
  } catch (error) {
    writeLog('error', 'Erro ao consultar atividades do usuário', { error: error.message });
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

module.exports = { list };
