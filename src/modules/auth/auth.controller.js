const authService = require('./auth.service');
const prisma = require('../../database/prisma');
const { writeLog } = require('../../services/logger.service');

async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios' });
  }

  try {
    const user = await authService.register({ name, email, password });
    res.status(201).json(user);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'E-mail já cadastrado' });
    }

    writeLog('error', 'Erro ao registrar usuário', { error: error.message });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
  }

  try {
    const result = await authService.login({ email, password });

    if (!result) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    res.json({ message: 'Login realizado com sucesso', ...result });
  } catch (error) {
    writeLog('error', 'Erro ao autenticar usuário', { error: error.message });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

async function me(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (error) {
    writeLog('error', 'Erro ao buscar usuário', { error: error.message });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

module.exports = { register, login, me };
